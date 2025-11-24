// backend/models/Discount.js
const mongoose = require("mongoose");

const discountSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["percentage", "fixed", "bogo"],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    // For BOGO: buy X items
    bogoConfig: {
      buyQuantity: { type: Number, default: 1 },
      getQuantity: { type: Number, default: 1 },
      getDiscountPercent: { type: Number, default: 100 }, // 100 = free, 50 = half off
      applicableItems: [
        { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" },
      ],
    },
    // Scope: what this discount applies to
    scope: {
      type: String,
      enum: ["all", "category", "items"],
      default: "all",
    },
    applicableCategories: [{ type: String }],
    applicableItems: [
      { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" },
    ],
    // Scheduling
    isActive: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    // Happy Hour scheduling
    isHappyHour: {
      type: Boolean,
      default: false,
    },
    happyHourConfig: {
      daysOfWeek: [{ type: Number, min: 0, max: 6 }], // 0=Sunday, 6=Saturday
      startTime: { type: String }, // "14:00"
      endTime: { type: String }, // "18:00"
    },
    // Constraints
    minimumOrderAmount: {
      type: Number,
      default: 0,
    },
    maximumDiscountAmount: {
      type: Number,
      default: null, // null = no cap
    },
    usageLimit: {
      type: Number,
      default: null, // null = unlimited
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    // Order type restrictions
    applicableOrderTypes: {
      type: [String],
      enum: ["dine-in", "takeaway", "delivery"],
      default: ["dine-in", "takeaway", "delivery"],
    },
    // Metadata
    lastAction: {
      action: {
        type: String,
        enum: ["create", "update", "delete"],
        default: null,
      },
      performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      createdAt: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

// Index for efficient querying
discountSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
discountSchema.index({ isHappyHour: 1 });

module.exports = mongoose.model("Discount", discountSchema);
