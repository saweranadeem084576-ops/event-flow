const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Booking = require("../models/bookingModel");
const Event = require("../models/eventModel");
const Ticket = require("../models/ticketModel");
const Notification = require("../models/notificationModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// ========== CREATE STRIPE CHECKOUT SESSION ==========
exports.createCheckoutSession = catchAsync(async (req, res, next) => {
  const { eventId, numberOfTickets = 1 } = req.body;
  const ticketCount = Number(numberOfTickets);

  const event = await Event.findById(eventId);
  if (!event) return next(new AppError("No event found with that ID", 404));
  if (event.status !== "approved")
    return next(new AppError("This event is not available for booking", 400));
  if (new Date(event.date) < new Date())
    return next(new AppError("This event has already passed", 400));
  if (event.availableSeats < ticketCount)
    return next(
      new AppError(`Only ${event.availableSeats} seats available`, 400),
    );

  const frontendURL = process.env.FRONTEND_URL || "http://localhost:5173";
  const backendURL = process.env.BACKEND_URL || "http://localhost:5000";
  const totalPrice = event.price * ticketCount;

  // Free event — create booking directly, no Stripe needed
  if (event.price === 0) {
    await _fulfillBooking({
      eventId,
      userId: req.user._id.toString(),
      ticketCount,
      totalPrice: 0,
    });
    return res.status(200).json({ status: "success", free: true });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: event.title,
            description: `${ticketCount} ticket(s) · ${event.location}`,
            images:
              event.image && event.image !== "default-event.jpg"
                ? [`${backendURL}/img/events/${event.image}`]
                : [],
          },
          unit_amount: Math.round(event.price * 100),
        },
        quantity: ticketCount,
      },
    ],
    metadata: {
      eventId: event._id.toString(),
      userId: req.user._id.toString(),
      numberOfTickets: ticketCount.toString(),
      totalPrice: totalPrice.toString(),
    },
    success_url: `${frontendURL}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${frontendURL}/events/${event._id}`,
  });

  res.status(200).json({ status: "success", url: session.url });
});

// ========== STRIPE WEBHOOK ==========
exports.webhookCheckout = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const { eventId, userId, numberOfTickets, totalPrice } =
      event.data.object.metadata;
    await _fulfillBooking({
      eventId,
      userId,
      ticketCount: Number(numberOfTickets),
      totalPrice: Number(totalPrice),
    });
  }

  res.status(200).json({ received: true });
};

// ========== INTERNAL FULFILLMENT ==========
async function _fulfillBooking({ eventId, userId, ticketCount, totalPrice }) {
  const booking = await Booking.create({
    event: eventId,
    user: userId,
    numberOfTickets: ticketCount,
    totalPrice,
    status: "confirmed",
  });

  await Event.findByIdAndUpdate(eventId, {
    $inc: { availableSeats: -ticketCount },
  });

  await Ticket.create({
    booking: booking._id,
    event: eventId,
    user: userId,
    ticketType: "general",
  });

  await Notification.create({
    user: userId,
    message: `Payment confirmed! Your booking has been created and ticket generated.`,
    type: "payment_confirmation",
  });
}

// ========== GET MY PAYMENTS ==========
exports.getMyPayments = catchAsync(async (req, res) => {
  const bookings = await Booking.find({
    user: req.user._id,
    status: "confirmed",
  }).sort("-createdAt");

  res.status(200).json({
    status: "success",
    results: bookings.length,
    data: { data: bookings },
  });
});
