const express = require("express");
const bookingController = require("../controllers/bookingController");
const authController = require("../controllers/authController");

const router = express.Router();

// All booking routes are protected
router.use(authController.protect);

// --- USER ROUTES ---
router.post("/", bookingController.createBooking);
router.get("/my-bookings", bookingController.getMyBookings);
router.patch("/:id/cancel", bookingController.cancelBooking);

// --- ORGANIZER: GET BOOKINGS FOR THEIR EVENT ---
router.get(
  "/event/:eventId",
  authController.restrictTo("organizer", "admin"),
  bookingController.getBookingsForEvent,
);

// --- SINGLE BOOKING ---
router.get("/:id", bookingController.getBooking);

// --- ADMIN ONLY ---
router.get(
  "/",
  authController.restrictTo("admin"),
  bookingController.getAllBookings,
);

module.exports = router;
