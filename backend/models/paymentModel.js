const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.ObjectId,
      ref: "Booking",
      required: [true, "Payment must belong to a booking"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Payment must belong to a user"],
    },
    amount: {
      type: Number,
      required: [true, "Payment must have an amount"],
    },
    method: {
      type: String,
      enum: {
        values: ["card", "cash"],
        message: "Payment method must be either card or cash",
      },
      required: [true, "Payment must have a method"],
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    paymentDate: {
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

// --- QUERY MIDDLEWARE ---
paymentSchema.pre(/^find/, function (next) {
  this.populate({
    path: "booking",
    select: "event numberOfTickets status",
  }).populate({
    path: "user",
    select: "name email",
  });
  next();
});

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
