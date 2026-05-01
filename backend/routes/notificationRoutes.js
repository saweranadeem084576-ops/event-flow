const express = require("express");
const notificationController = require("../controllers/notificationController");
const authController = require("../controllers/authController");

const router = express.Router();

// All notification routes are protected
router.use(authController.protect);

// --- USER ROUTES ---
router.get("/my-notifications", notificationController.getMyNotifications);
router.patch("/mark-all-read", notificationController.markAllAsRead);
router.patch("/:id/read", notificationController.markAsRead);
router.delete("/:id", notificationController.deleteNotification);

// --- ADMIN ONLY ---
router.post(
  "/",
  authController.restrictTo("admin"),
  notificationController.createNotification,
);
router.get(
  "/",
  authController.restrictTo("admin"),
  notificationController.getAllNotifications,
);

module.exports = router;
