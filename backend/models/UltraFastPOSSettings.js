// backend/models/UltraFastPOSSettings.js
const mongoose = require("mongoose");

const ultraFastPOSSettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
    keyboardShortcuts: {
      type: Object,
      default: {},
    },
    itemShortcuts: [
      {
        key: { type: String, required: true },
        menuItemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MenuItem",
          required: true,
        },
      },
    ],
    preferences: {
      autoPrint: { type: Boolean, default: true },
      soundEnabled: { type: Boolean, default: true },
      highContrast: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

// Settings are unique per user per store
ultraFastPOSSettingsSchema.index({ storeId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model(
  "UltraFastPOSSettings",
  ultraFastPOSSettingsSchema
);
