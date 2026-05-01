const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.ObjectId,
      ref: "Booking",
      required: [true, "Ticket must belong to a booking"],
    },
    event: {
      type: mongoose.Schema.ObjectId,
      ref: "Event",
      required: [true, "Ticket must belong to an event"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Ticket must belong to a user"],
    },
    ticketType: {
      type: String,
      enum: ["general", "vip", "premium"],
      default: "general",
    },
    issueDate: {
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
ticketSchema.pre(/^find/, function (next) {
  this.populate({
    path: "event",
    select: "title date location",
  }).populate({
    path: "user",
    select: "name email",
  });
  next();
});

const Ticket = mongoose.model("Ticket", ticketSchema);

module.exports = Ticket;
