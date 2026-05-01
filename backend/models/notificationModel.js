const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Notification must belong to a user"],
    },
    message: {
      type: String,
      required: [true, "Notification must have a message"],
      trim: true,
    },
    type: {
      type: String,
      enum: [
        "booking_confirmation",
        "event_update",
        "payment_confirmation",
        "general",
      ],
      default: "general",
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Index for fast retrieval of user notifications
notificationSchema.index({ user: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
