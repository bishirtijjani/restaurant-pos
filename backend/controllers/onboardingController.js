const OnboardingProgress = require("../models/OnboardingProgress");
const logAction = require("../utils/logAction");

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

    await logAction(
      req.user.id,
      req.storeId,
      req.user.organizationId, // organizationId might be on req or req.user, assuming req.user given previous files, or req.organizationId if middleware sets it. Standard controllers use req.organizationId. Let's check middleware context usage in other files.
      // onboardingController.js doesn't show standard req.organizationId usage in other methods, but importExport used req.user.organizationId.
      // Let's use req.organizationId if available, fallback to req.user.organizationId.
      // Wait, let's verify context.
      // Most controllers use `req.organizationId`.
      // I'll use `req.organizationId`.
      req.organizationId || (req.user && req.user.organizationId),
      "Onboarding",
      userId,
      "delete",
      null,
      null,
      `Reset onboarding progress for user: ${userId}`
    );

    res.json({ success: true, message: "Progress reset successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
