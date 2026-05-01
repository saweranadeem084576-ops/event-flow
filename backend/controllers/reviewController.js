const Review = require("../models/reviewModel");
const Booking = require("../models/bookingModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const factory = require("./handlerFactory");

// --- SET EVENT AND USER IDS BEFORE CREATE ---
exports.setEventUserIds = (req, res, next) => {
  if (!req.body.event) req.body.event = req.params.eventId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

// --- CHECK IF USER ATTENDED THE EVENT ---
exports.checkIfAttended = catchAsync(async (req, res, next) => {
  const eventId = req.body.event || req.params.eventId;

  const booking = await Booking.findOne({
    user: req.user.id,
    event: eventId,
    status: "confirmed",
  });

  if (!booking) {
    return next(
      new AppError(
        "You can only review events you have booked and attended",
        403,
      ),
    );
  }

  next();
});

// ========== CRUD ==========
exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
