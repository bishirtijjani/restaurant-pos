const mongoose = require("mongoose");

const syncJobSchema = new mongoose.Schema(
  {
    jobId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["menu_publish", "addon_publish", "category_publish"],
      required: true,
    },
    masterId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    masterType: {
      type: String,
      enum: ["MenuItem", "AddOnGroup", "Category"],
      required: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
      index: true,
    },
    affectedStores: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store",
      },
    ],
    progress: {
      completed: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
    },
    error: {
      type: String,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Index for efficient job status queries
syncJobSchema.index({ status: 1, createdAt: -1 });
syncJobSchema.index({ organizationId: 1, status: 1 });

module.exports = mongoose.model("SyncJob", syncJobSchema);
