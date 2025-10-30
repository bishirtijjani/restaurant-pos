const mongoose = require("mongoose");

const GeneralSettingsSchema = new mongoose.Schema(
  {
    // Company Info
    companyLogo: {
      type: String,
      trim: true,
      default: "📦",
    },
    companyName: {
      type: String,
      trim: true,
      default: "Codeket Ltd.",
    },
    companyAddress: {
      type: String,
      trim: true,
      default: "No. 123, Main Road, Colombo 01",
    },
    companyPhone: {
      type: String,
      trim: true,
      default: "+234 906 814 9540",
    },
    companyEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "contact@codeket.com",
    },
    companyMotto: {
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("GeneralSettings", GeneralSettingsSchema);
