const mongoose = require("mongoose");
const slugify = require("slugify");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "An event must have a title"],
      trim: true,
      maxlength: [100, "An event title must have at most 100 characters"],
    },
    slug: String,
    description: {
      type: String,
      required: [true, "An event must have a description"],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "An event must have a date"],
    },
    time: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      required: [true, "An event must have a location"],
      trim: true,
    },
    price: {
      type: Number,
      default: 0,
    },
    availableSeats: {
      type: Number,
      required: [true, "An event must have available seats count"],
    },
    category: {
      type: String,
      required: [true, "An event must have a category"],
      enum: {
        values: [
          "conference",
          "seminar",
          "workshop",
          "concert",
          "exhibition",
          "meetup",
          "wedding",
          "other",
        ],
        message:
          "Category must be: conference, seminar, workshop, concert, exhibition, meetup, wedding, or other",
      },
    },
    image: {
      type: String,
      default: "default-event.jpg",
    },
    organizer: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "An event must belong to an organizer"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "cancelled"],
      default: "pending",
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// --- INDEXES ---
eventSchema.index({ price: 1, ratingsAverage: -1 });
eventSchema.index({ slug: 1 });
eventSchema.index({ date: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ organizer: 1 });

// --- VIRTUAL POPULATE ---
eventSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "event",
  localField: "_id",
});

eventSchema.virtual("bookings", {
  ref: "Booking",
  foreignField: "event",
  localField: "_id",
});

// --- DOCUMENT MIDDLEWARE ---
eventSchema.pre("save", function (next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});

// --- QUERY MIDDLEWARE ---
eventSchema.pre(/^find/, function (next) {
  this.populate({
    path: "organizer",
    select: "name email photo",
  });
  next();
});

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
