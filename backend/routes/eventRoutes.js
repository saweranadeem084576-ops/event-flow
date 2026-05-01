const express = require("express");
const eventController = require("../controllers/eventController");
const authController = require("../controllers/authController");
const reviewRouter = require("./reviewRoutes");

const router = express.Router();

// --- NESTED ROUTES: /events/:eventId/reviews ---
router.use("/:eventId/reviews", reviewRouter);

// --- PUBLIC ROUTES ---
router.get("/", eventController.getAllEvents);
router.get("/stats", eventController.getEventStats);

// Organizer route — declared before /:id to avoid route conflict
router.get(
  "/my/events",
  authController.protect,
  authController.restrictTo("organizer", "admin"),
  eventController.getMyEvents,
);

// Single event — public (no auth required)
router.get("/:id", eventController.getEvent);

// --- ALL ROUTES BELOW REQUIRE AUTH ---
router.use(authController.protect);

router.post(
  "/",
  authController.restrictTo("organizer", "admin"),
  eventController.uploadEventImage,
  eventController.resizeEventImage,
  eventController.setOrganizerId,
  eventController.createEvent,
);

router
  .route("/:id")
  .patch(
    authController.restrictTo("organizer", "admin"),
    eventController.uploadEventImage,
    eventController.resizeEventImage,
    eventController.updateEvent,
  )
  .delete(
    authController.restrictTo("organizer", "admin"),
    eventController.deleteEvent,
  );

// --- ADMIN ONLY ---
router.patch(
  "/:id/approve",
  authController.restrictTo("admin"),
  eventController.approveEvent,
);

module.exports = router;
