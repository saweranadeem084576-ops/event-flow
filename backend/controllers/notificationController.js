const Notification = require("../models/notificationModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const factory = require("./handlerFactory");

// ========== GET MY NOTIFICATIONS ==========
exports.getMyNotifications = catchAsync(async (req, res, next) => {
  const notifications = await Notification.find({ user: req.user.id }).sort(
    "-createdAt",
  );

  res.status(200).json({
    status: "success",
    results: notifications.length,
    data: { data: notifications },
  });
});

// ========== MARK AS READ ==========
exports.markAsRead = catchAsync(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new AppError("No notification found with that ID", 404));
  }

  if (notification.user.toString() !== req.user.id) {
    return next(
      new AppError("You can only update your own notifications", 403),
    );
  }

  notification.read = true;
  await notification.save();

  res.status(200).json({
    status: "success",
    data: { data: notification },
  });
});

// ========== MARK ALL AS READ ==========
exports.markAllAsRead = catchAsync(async (req, res, next) => {
  await Notification.updateMany(
    { user: req.user.id, read: false },
    { read: true },
  );

  res.status(200).json({
    status: "success",
    message: "All notifications marked as read",
  });
});

// ========== DELETE NOTIFICATION ==========
exports.deleteNotification = catchAsync(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new AppError("No notification found with that ID", 404));
  }

  if (notification.user.toString() !== req.user.id) {
    return next(
      new AppError("You can only delete your own notifications", 403),
    );
  }

  await Notification.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// ========== ADMIN: CREATE NOTIFICATION ==========
exports.createNotification = factory.createOne(Notification);

// ========== ADMIN: GET ALL NOTIFICATIONS ==========
exports.getAllNotifications = factory.getAll(Notification);
