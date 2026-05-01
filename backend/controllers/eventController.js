const multer = require("multer");
const sharp = require("sharp");
const Event = require("../models/eventModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const factory = require("./handlerFactory");

// --- MULTER CONFIG FOR EVENT IMAGE UPLOAD ---
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadEventImage = upload.single("image");

exports.resizeEventImage = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `event-${req.params.id || "new"}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(2000, 1333)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/events/${req.file.filename}`);

  req.body.image = req.file.filename;
  next();
});

// --- SET ORGANIZER ID BEFORE CREATE ---
exports.setOrganizerId = (req, res, next) => {
  if (!req.body.organizer) req.body.organizer = req.user._id;
  next();
};

// --- CREATE EVENT (ORGANIZER) ---
exports.createEvent = factory.createOne(Event);

// --- GET ALL EVENTS (PUBLIC — approved only) ---
exports.getAllEvents = catchAsync(async (req, res, next) => {
  // Build filter
  let filter = { status: "approved" };

  // Allow admin to see all statuses
  if (req.user && req.user.role === "admin" && req.query.status) {
    filter.status = req.query.status;
  } else if (req.user && req.user.role === "admin") {
    delete filter.status;
  }

  // Category filter
  if (req.query.category) {
    filter.category = req.query.category;
  }

  // Date filter — upcoming events
  if (req.query.upcoming === "true") {
    filter.date = { $gte: new Date() };
  }

  // Free events filter
  if (req.query.price !== undefined) {
    filter.price = Number(req.query.price);
  }

  // Search by title or location
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, "i");
    filter.$or = [{ title: searchRegex }, { location: searchRegex }];
  }

  // Sorting
  let sortBy = "-date";
  if (req.query.sort) {
    sortBy = req.query.sort.split(",").join(" ");
  }

  // Pagination
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 10;
  const skip = (page - 1) * limit;

  const events = await Event.find(filter).sort(sortBy).skip(skip).limit(limit);

  const total = await Event.countDocuments(filter);

  res.status(200).json({
    status: "success",
    results: events.length,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: { data: events },
  });
});

// --- GET ONE EVENT ---
exports.getEvent = factory.getOne(Event, { path: "reviews" });

// --- UPDATE EVENT (ORGANIZER/ADMIN) ---
exports.updateEvent = catchAsync(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(new AppError("No event found with that ID", 404));
  }

  // Only the organizer who created it or admin can update
  if (
    event.organizer._id.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    return next(
      new AppError("You do not have permission to update this event", 403),
    );
  }

  const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: { data: updatedEvent },
  });
});

// --- DELETE EVENT (ORGANIZER/ADMIN) ---
exports.deleteEvent = catchAsync(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(new AppError("No event found with that ID", 404));
  }

  // Only the organizer who created it or admin can delete
  if (
    event.organizer._id.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    return next(
      new AppError("You do not have permission to delete this event", 403),
    );
  }

  await Event.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// --- GET MY EVENTS (ORGANIZER) ---
exports.getMyEvents = catchAsync(async (req, res, next) => {
  const events = await Event.find({ organizer: req.user.id });

  res.status(200).json({
    status: "success",
    results: events.length,
    data: { data: events },
  });
});

// --- APPROVE EVENT (ADMIN) ---
exports.approveEvent = catchAsync(async (req, res, next) => {
  const event = await Event.findByIdAndUpdate(
    req.params.id,
    { status: "approved" },
    { new: true, runValidators: true },
  );

  if (!event) {
    return next(new AppError("No event found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: { data: event },
  });
});

// --- GET EVENT STATS (ADMIN) ---
exports.getEventStats = catchAsync(async (req, res, next) => {
  const stats = await Event.aggregate([
    {
      $group: {
        _id: "$category",
        numEvents: { $sum: 1 },
        avgPrice: { $avg: "$price" },
        avgRating: { $avg: "$ratingsAverage" },
        totalSeats: { $sum: "$availableSeats" },
      },
    },
    { $sort: { numEvents: -1 } },
  ]);

  res.status(200).json({
    status: "success",
    data: { stats },
  });
});
