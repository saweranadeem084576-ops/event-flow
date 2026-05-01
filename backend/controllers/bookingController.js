const Booking = require("../models/bookingModel");
const Event = require("../models/eventModel");
const Notification = require("../models/notificationModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const factory = require("./handlerFactory");

// ========== CREATE BOOKING ==========
exports.createBooking = catchAsync(async (req, res, next) => {
  const { eventId, numberOfTickets } = req.body;

  // 1) Get the event
  const event = await Event.findById(eventId);
  if (!event) {
    return next(new AppError("No event found with that ID", 404));
  }

  // 2) Check if event is approved
  if (event.status !== "approved") {
    return next(new AppError("This event is not available for booking", 400));
  }

  // 3) Check if event date has not passed
  if (new Date(event.date) < new Date()) {
    return next(new AppError("This event has already passed", 400));
  }

  // 4) Check available seats
  const ticketCount = numberOfTickets || 1;
  if (event.availableSeats < ticketCount) {
    return next(
      new AppError(
        `Only ${event.availableSeats} seats available for this event`,
        400,
      ),
    );
  }

  // 5) Check for existing active booking
  const existingBooking = await Booking.findOne({
    event: eventId,
    user: req.user.id,
    status: { $ne: "cancelled" },
  });

  if (existingBooking) {
    return next(new AppError("You have already booked this event", 400));
  }

  // 6) Calculate total price
  const totalPrice = event.price * ticketCount;

  // 7) Create the booking
  const booking = await Booking.create({
    event: eventId,
    user: req.user.id,
    numberOfTickets: ticketCount,
    totalPrice,
    status: "pending",
  });

  // 8) Decrease available seats
  await Event.findByIdAndUpdate(eventId, {
    $inc: { availableSeats: -ticketCount },
  });

  // 9) Create notification
  await Notification.create({
    user: req.user.id,
    message: `Your booking for "${event.title}" has been created. Please complete the payment.`,
    type: "booking_confirmation",
  });

  res.status(201).json({
    status: "success",
    data: { data: booking },
  });
});

// ========== GET MY BOOKINGS ==========
exports.getMyBookings = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user.id }).sort(
    "-bookingDate",
  );

  res.status(200).json({
    status: "success",
    results: bookings.length,
    data: { data: bookings },
  });
});

// ========== GET SINGLE BOOKING ==========
exports.getBooking = factory.getOne(Booking);

// ========== CANCEL BOOKING ==========
exports.cancelBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(new AppError("No booking found with that ID", 404));
  }

  // Only the user who booked or admin can cancel
  if (
    booking.user._id.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    return next(
      new AppError("You do not have permission to cancel this booking", 403),
    );
  }

  if (booking.status === "cancelled") {
    return next(new AppError("This booking is already cancelled", 400));
  }

  // Update booking status
  booking.status = "cancelled";
  await booking.save();

  // Restore available seats
  await Event.findByIdAndUpdate(booking.event._id, {
    $inc: { availableSeats: booking.numberOfTickets },
  });

  // Create notification
  await Notification.create({
    user: req.user.id,
    message: `Your booking for "${booking.event.title}" has been cancelled.`,
    type: "booking_confirmation",
  });

  res.status(200).json({
    status: "success",
    data: { data: booking },
  });
});

// ========== GET BOOKINGS FOR AN EVENT (ORGANIZER/ADMIN) ==========
exports.getBookingsForEvent = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ event: req.params.eventId });

  res.status(200).json({
    status: "success",
    results: bookings.length,
    data: { data: bookings },
  });
});

// ========== ADMIN: GET ALL BOOKINGS ==========
exports.getAllBookings = factory.getAll(Booking);
