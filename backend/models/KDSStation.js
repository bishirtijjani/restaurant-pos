// backend/models/KDSStation.js
const mongoose = require("mongoose");

const kdsStationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "grill",
        "fryer",
        "salad",
        "pizza",
        "dessert",
        "beverage",
        "expo",
        "all",
      ],
      required: true,
    },
    categories: [
      {
        type: String,
        trim: true,
      },
    ],
    displaySettings: {
      columns: { type: Number, default: 3, min: 1, max: 6 },
      autoAdvance: { type: Boolean, default: false },
      soundEnabled: { type: Boolean, default: true },
      soundVolume: { type: Number, default: 0.7, min: 0, max: 1 },
      colorScheme: {
        type: String,
        enum: ["default", "colorblind", "high-contrast"],
        default: "default",
      },
      fontSize: {
        type: String,
        enum: ["small", "medium", "large"],
        default: "medium",
      },
    },
    timingSettings: {
      warningTime: { type: Number, default: 10 }, // minutes
      criticalTime: { type: Number, default: 15 }, // minutes
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    assignedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("KDSStation", kdsStationSchema);
