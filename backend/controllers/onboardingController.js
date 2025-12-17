const OnboardingProgress = require("../models/OnboardingProgress");

// Get user's onboarding progress
exports.getProgress = async (req, res) => {
  try {
    let progress = await OnboardingProgress.findOne({
      userId: req.user.id,
      storeId: req.storeId,
    });

    if (!progress) {
      progress = await OnboardingProgress.create({
        userId: req.user.id,
        storeId: req.storeId,
        completedSteps: [],
        completedTours: [],
        skippedTours: [],
        hasCompletedInitialSetup: false,
      });
    }

    res.json({ success: true, data: progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update progress for a specific step
exports.updateStepProgress = async (req, res) => {
  try {
    const { tourId, stepId } = req.body;

    let progress = await OnboardingProgress.findOne({
      userId: req.user.id,
      storeId: req.storeId,
    });

    if (!progress) {
      progress = await OnboardingProgress.create({
        userId: req.user.id,
        storeId: req.storeId,
      });
    }

    // Check if step already completed
    const stepExists = progress.completedSteps.find(
      (s) => s.tourId === tourId && s.stepId === stepId
    );

    if (!stepExists) {
      progress.completedSteps.push({ tourId, stepId });
      await progress.save();
    }

    res.json({ success: true, data: progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Complete a tour
exports.completeTour = async (req, res) => {
  try {
    const { tourId } = req.body;

    let progress = await OnboardingProgress.findOne({
      userId: req.user.id,
      storeId: req.storeId,
    });

    if (!progress) {
      progress = await OnboardingProgress.create({
        userId: req.user.id,
        storeId: req.storeId,
      });
    }

    // Check if tour already completed
    const tourExists = progress.completedTours.find((t) => t.tourId === tourId);

    if (!tourExists) {
      progress.completedTours.push({ tourId });

      // If this is the initial setup tour, mark as completed
      if (tourId === "initial-setup") {
        progress.hasCompletedInitialSetup = true;
      }

      await progress.save();
    }

    res.json({ success: true, data: progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Skip a tour
exports.skipTour = async (req, res) => {
  try {
    const { tourId } = req.body;

    let progress = await OnboardingProgress.findOne({
      userId: req.user.id,
      storeId: req.storeId,
    });

    if (!progress) {
      progress = await OnboardingProgress.create({
        userId: req.user.id,
        storeId: req.storeId,
      });
    }

    const skipped = progress.skippedTours.find((t) => t.tourId === tourId);

    if (!skipped) {
      progress.skippedTours.push({ tourId });
      await progress.save();
    }

    res.json({ success: true, data: progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reset progress (admin only)
exports.resetProgress = async (req, res) => {
  try {
    const { userId } = req.params;

    await OnboardingProgress.findOneAndDelete({ userId, storeId: req.storeId });

    res.json({ success: true, message: "Progress reset successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
