const express = require("express");
const router = express.Router();
const onboardingController = require("../controllers/onboardingController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/progress", authMiddleware, onboardingController.getProgress);
router.post("/step", authMiddleware, onboardingController.updateStepProgress);
router.post("/complete", authMiddleware, onboardingController.completeTour);
router.post("/skip", authMiddleware, onboardingController.skipTour);
router.delete(
  "/reset/:userId",
  authMiddleware,
  onboardingController.resetProgress
);

module.exports = router;
