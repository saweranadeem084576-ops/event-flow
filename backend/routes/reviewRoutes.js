const express = require("express");
const reviewController = require("../controllers/reviewController");
const authController = require("../controllers/authController");

const router = express.Router({ mergeParams: true });
// mergeParams allows access to :eventId from nested route

// --- PUBLIC: GET REVIEWS ---
router.get("/", reviewController.getAllReviews);
router.get("/:id", reviewController.getReview);

// --- PROTECTED ROUTES ---
router.use(authController.protect);

router.post(
  "/",
  authController.restrictTo("user"),
  reviewController.setEventUserIds,
  reviewController.checkIfAttended,
  reviewController.createReview,
);

router
  .route("/:id")
  .patch(
    authController.restrictTo("user", "admin"),
    reviewController.updateReview,
  )
  .delete(
    authController.restrictTo("user", "admin"),
    reviewController.deleteReview,
  );

module.exports = router;
