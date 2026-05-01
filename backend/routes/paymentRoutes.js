const express = require("express");
const paymentController = require("../controllers/paymentController");
const authController = require("../controllers/authController");

const router = express.Router();

// All payment routes are protected
router.use(authController.protect);

router.post(
  "/create-checkout-session",
  paymentController.createCheckoutSession,
);
router.get("/my-payments", paymentController.getMyPayments);

module.exports = router;
