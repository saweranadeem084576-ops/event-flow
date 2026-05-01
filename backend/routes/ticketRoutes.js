const express = require("express");
const ticketController = require("../controllers/ticketController");
const authController = require("../controllers/authController");

const router = express.Router();

// All ticket routes are protected
router.use(authController.protect);

// --- USER ROUTES ---
router.get("/my-tickets", ticketController.getMyTickets);
router.get("/:id", ticketController.getTicket);

// --- ADMIN ONLY ---
router.get(
  "/",
  authController.restrictTo("admin"),
  ticketController.getAllTickets,
);

module.exports = router;
