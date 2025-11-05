const express = require("express");
const router = express.Router();
const onboardingController = require("../controllers/onboardingController");

router.get("/progress", onboardingController.getProgress);
router.post("/step", onboardingController.updateStepProgress);
router.post("/complete", onboardingController.completeTour);
router.post("/skip", onboardingController.skipTour);
router.delete("/reset/:userId", onboardingController.resetProgress);

module.exports = router;
