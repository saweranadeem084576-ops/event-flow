const mongoose = require("mongoose");
const Event = require("./eventModel");

const reviewSchema = new mongoose.Schema(
  {
    comment: {
      type: String,
      required: [true, "Review cannot be empty!"],
      trim: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "A review must have a rating"],
    },
    event: {
      type: mongoose.Schema.ObjectId,
      ref: "Event",
      required: [true, "Review must belong to an event"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Each user can only leave one review per event
reviewSchema.index({ event: 1, user: 1 }, { unique: true });

// --- QUERY MIDDLEWARE ---
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name photo",
  });
  next();
});

// --- STATIC METHODS ---
reviewSchema.statics.calcAverageRatings = async function (eventId) {
  const stats = await this.aggregate([
    { $match: { event: eventId } },
    {
      $group: {
        _id: "$event",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    await Event.findByIdAndUpdate(eventId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Event.findByIdAndUpdate(eventId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

// Call calcAverageRatings after save
reviewSchema.post("save", function () {
  this.constructor.calcAverageRatings(this.event);
});

// Call calcAverageRatings after update/delete
reviewSchema.post(/^findOneAnd/, async function (doc) {
  if (doc) {
    await doc.constructor.calcAverageRatings(doc.event);
  }
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
