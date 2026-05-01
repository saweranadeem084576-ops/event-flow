const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { Email } = require("../utils/email");

// ── Full access token (long-lived) ──────────────────────────────────────────
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

// ── Pre-auth token (short-lived, used only during OTP verification) ─────────
const signPreAuthToken = (userId) =>
  jwt.sign({ id: userId, type: "preauth" }, process.env.JWT_SECRET, {
    expiresIn: "10m",
  });

// ── Cookie name — single source of truth ────────────────────────────────────
const COOKIE_NAME = "jwt";

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
  };

  res.cookie(COOKIE_NAME, token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    data: { user },
  });
};

// ========== SIGNUP ==========
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role || "attendee",
  });

  // Generate OTP for email verification
  const otp = newUser.createTwoFactorCode();
  await newUser.save({ validateBeforeSave: false });

  // Send welcome + OTP email (non-blocking on welcome, blocking on OTP)
  try {
    await new Email(newUser).sendTwoFactorCode(otp);
  } catch (err) {
    newUser.twoFactorCode = undefined;
    newUser.twoFactorExpires = undefined;
    await newUser.save({ validateBeforeSave: false });
    return next(
      new AppError("Failed to send verification email. Try again.", 500),
    );
  }

  // Issue pre-auth token (10 min) — real access token granted after OTP
  const preAuthToken = signPreAuthToken(newUser._id);

  res.status(201).json({
    status: "pending_otp",
    preAuthToken,
    message: "Verification code sent to your email.",
  });
});

// ========== LOGIN ==========
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // Generate OTP and send it
  const otp = user.createTwoFactorCode();
  await user.save({ validateBeforeSave: false });

  try {
    await new Email(user).sendTwoFactorCode(otp);
  } catch (err) {
    user.twoFactorCode = undefined;
    user.twoFactorExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError("Failed to send verification email. Try again.", 500),
    );
  }

  // Issue pre-auth token (10 min)
  const preAuthToken = signPreAuthToken(user._id);

  res.status(200).json({
    status: "pending_otp",
    preAuthToken,
    message: "Verification code sent to your email.",
  });
});

// ========== VERIFY OTP ==========
exports.verifyTwoFactor = catchAsync(async (req, res, next) => {
  const { preAuthToken, code } = req.body;

  if (!preAuthToken || !code) {
    return next(
      new AppError("Please provide preAuthToken and verification code.", 400),
    );
  }

  // 1) Verify and decode pre-auth token
  let decoded;
  try {
    decoded = await promisify(jwt.verify)(preAuthToken, process.env.JWT_SECRET);
  } catch (err) {
    return next(
      new AppError(
        "Pre-auth token is invalid or has expired. Please log in again.",
        401,
      ),
    );
  }

  if (decoded.type !== "preauth") {
    return next(new AppError("Invalid token type.", 401));
  }

  // 2) Find user and check OTP
  const hashedCode = crypto
    .createHash("sha256")
    .update(String(code))
    .digest("hex");

  const user = await User.findOne({
    _id: decoded.id,
    twoFactorCode: hashedCode,
    twoFactorExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Invalid or expired verification code.", 401));
  }

  // 3) Clear OTP fields and mark email verified
  user.twoFactorCode = undefined;
  user.twoFactorExpires = undefined;
  user.emailVerified = true;
  await user.save({ validateBeforeSave: false });

  // 4) Issue full access token
  createSendToken(user, 200, res);
});

// ========== LOGOUT ==========
exports.logout = (req, res) => {
  res.cookie(COOKIE_NAME, "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
  });
  res.status(200).json({ status: "success" });
};

// ========== PROTECT (AUTH MIDDLEWARE) ==========
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get token and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies[COOKIE_NAME]) {
    token = req.cookies[COOKIE_NAME];
  }

  // Reject the placeholder value written by logout
  if (!token || token === "loggedout") {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401),
    );
  }

  // 2) Verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Reject pre-auth tokens — they are only valid for OTP verification
  if (decoded.type === "preauth") {
    return next(
      new AppError("You are not logged in! Please verify your OTP first.", 401),
    );
  }

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError("The user belonging to this token no longer exists.", 401),
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401),
    );
  }

  // Grant access to protected route
  req.user = currentUser;
  next();
});

// ========== RESTRICT TO ROLES ==========
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403),
      );
    }
    next();
  };

// ========== FORGOT PASSWORD ==========
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with that email address.", 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const frontendURL = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetURL = `${frontendURL}/reset-password/${resetToken}`;

  try {
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: "success",
      message: "Password reset link sent to email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "There was an error sending the email. Try again later!",
        500,
      ),
    );
  }
});

// ========== RESET PASSWORD ==========
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Log the user in, send JWT
  createSendToken(user, 200, res);
});

// ========== UPDATE PASSWORD (LOGGED IN USERS) ==========
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select("+password");

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Your current password is wrong.", 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});
