const mongoose = require("mongoose");

const onboardingProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    completedSteps: [
      {
        tourId: { type: String, required: true },
        stepId: { type: String, required: true },
        completedAt: { type: Date, default: Date.now },
      },
    ],
    completedTours: [
      {
        tourId: { type: String, required: true },
        completedAt: { type: Date, default: Date.now },
      },
    ],
    skippedTours: [
      {
        tourId: { type: String, required: true },
        skippedAt: { type: Date, default: Date.now },
      },
    ],
    hasCompletedInitialSetup: {
      type: Boolean,
      default: false,
    },
    currentTourId: {
      type: String,
      default: null,
    },
    lastActiveStep: {
      tourId: String,
      stepIndex: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OnboardingProgress", onboardingProgressSchema);
