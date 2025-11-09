const express = require("express");
const router = express.Router();
const onboardingController = require("../controllers/onboardingController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Apply auth middleware to all routes
router.use(authMiddleware);

router.get("/progress", onboardingController.getProgress);
router.post("/step", onboardingController.updateStepProgress);
router.post("/complete", onboardingController.completeTour);
router.post("/skip", onboardingController.skipTour);
router.delete(
  "/reset/:userId",
  roleMiddleware("admin"),
  onboardingController.resetProgress
);

module.exports = router;
