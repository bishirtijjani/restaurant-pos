const mongoose = require("mongoose");

const GeneralSettingsSchema = new mongoose.Schema(
  {
    // Restaurant Info
    restaurantLogo: {
      type: String,
      trim: true,
      default: "📦",
    },
    restaurantName: {
      type: String,
      trim: true,
      default: "Codeket Ltd.",
    },
    restaurantAddress: {
      type: String,
      trim: true,
      default: "No. 123, Main Road, Colombo 01",
    },
    restaurantPhone: {
      type: String,
      trim: true,
      default: "+234 906 814 9540",
    },
    restaurantEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "contact@codeket.com",
    },
    restaurantMotto: {
      type: String,
      trim: true,
      default: "",
    },

    // Currency & Format - Updated to store currency object
    currency: {
      code: {
        type: String,
        default: "USD",
      },
      name: {
        type: String,
        default: "US Dollar",
      },
      symbol: {
        type: String,
        default: "$",
      },
    },
    dateFormat: {
      type: String,
      enum: ["MM/DD/YYYY", "DD/MM/YYYY"],
      default: "MM/DD/YYYY",
    },

    // Inventory Settings
    lowStockAlert: {
      type: Number,
      default: 10,
    },
    autoGenerateSKU: {
      type: Boolean,
      default: true,
    },

    // Tax
    taxRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // Notifications
    emailNotifications: {
      type: Boolean,
      default: true,
    },

    // System
    timezone: {
      type: String,
      default: "Nigeria/Lagos",
    },

    taxSettings: {
      enabled: { type: Boolean, default: true },
      globalRate: { type: Number, default: 7.5, min: 0, max: 100 },
      name: { type: String, default: "VAT" },
      mode: {
        type: String,
        enum: ["per-item", "per-order"],
        default: "per-item",
      },
      includeInPrice: { type: Boolean, default: false },
    },
    serviceCharge: {
      enabled: { type: Boolean, default: false },
      rate: { type: Number, default: 0, min: 0, max: 100 },
      name: { type: String, default: "Service Charge" },
      applyTo: {
        type: String,
        enum: ["all", "dine-in", "delivery"],
        default: "dine-in",
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("GeneralSettings", GeneralSettingsSchema);
