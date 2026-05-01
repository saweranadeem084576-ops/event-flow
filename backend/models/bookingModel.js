const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.ObjectId,
      ref: "Event",
      required: [true, "Booking must belong to an event"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Booking must belong to a user"],
    },
    numberOfTickets: {
      type: Number,
      default: 1,
      min: [1, "Number of tickets must be at least 1"],
    },
    totalPrice: {
      type: Number,
      required: [true, "Booking must have a total price"],
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Compound index: a user should not book the same event twice (unless cancelled)
bookingSchema.index({ event: 1, user: 1 });

// --- QUERY MIDDLEWARE ---
bookingSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name email",
  }).populate({
    path: "event",
    select: "title date location price image",
  });
  next();
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
