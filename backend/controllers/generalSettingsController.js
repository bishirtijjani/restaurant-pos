const Store = require("../models/Store");
const Organization = require("../models/Organization");
const { getEffectiveSettings } = require("../utils/settingsManager");
const logAction = require("../utils/logAction");

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// @desc    Get general settings for the current store
// @route   GET /api/settings
// @access  Private
const getSettings = async (req, res) => {
  try {
    const store = await Store.findById(req.storeId).lean();
    const effectiveSettings = await getEffectiveSettings(req.storeId);

    if (!effectiveSettings) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    res.json({
      success: true,
      data: effectiveSettings,
      overrides: store.settings || {}, // Provide raw overrides for UI indicators
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching settings",
    });
  }
};

// @desc    Update general settings for the current store
// @route   PUT /api/settings
// @access  Private
const updateSettings = async (req, res) => {
  try {
    const {
      // Store identity fields (name, address, phone) removed - use Store model directly
      restaurantEmail,
      restaurantMotto,
      currency,
      dateFormat,
      lowStockAlert,
      autoGenerateSKU,
      taxRate,
      emailNotifications,
      timezone,
      taxSettings,
      serviceCharge,
      globalDiscount,
      paymentGateways,
      communication,
      printerSettings,
    } = req.body;

    // Validate required fields only if they are being updated
    // Removed: restaurantName, restaurantAddress, restaurantPhone validations
    // These are now top-level Store fields, not settings

    if (
      restaurantEmail !== undefined &&
      (!restaurantEmail || restaurantEmail.trim() === "")
    ) {
      return res.status(400).json({
        success: false,
        message: "Restaurant email is required",
      });
    }

    // Validate email format only if email is being updated
    if (restaurantEmail !== undefined && !emailRegex.test(restaurantEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // Validate currency object only if currency is being updated
    if (
      currency !== undefined &&
      (!currency || !currency.code || !currency.name || !currency.symbol)
    ) {
      return res.status(400).json({
        success: false,
        message: "Currency information is incomplete",
      });
    }

    // Validate tax rate (Legacy field check, though taxSettings is preferred)
    if (taxRate !== undefined && (taxRate < 0 || taxRate > 100)) {
      return res.status(400).json({
        success: false,
        message: "Tax rate must be between 0 and 100",
      });
    }

    // Validate low stock alert
    if (lowStockAlert < 0) {
      return res.status(400).json({
        success: false,
        message: "Low stock alert must be a positive number",
      });
    }

    // Validate taxSettings if provided
    if (taxSettings) {
      if (
        taxSettings.globalRate !== undefined &&
        (taxSettings.globalRate < 0 || taxSettings.globalRate > 100)
      ) {
        return res.status(400).json({
          success: false,
          message: "Tax rate must be between 0 and 100",
        });
      }
    }

    // Validate serviceCharge if provided
    if (serviceCharge) {
      if (
        serviceCharge.rate !== undefined &&
        (serviceCharge.rate < 0 || serviceCharge.rate > 100)
      ) {
        return res.status(400).json({
          success: false,
          message: "Service charge rate must be between 0 and 100",
        });
      }
    }

    // Validate globalDiscount if provided
    if (globalDiscount) {
      if (globalDiscount.value !== undefined && globalDiscount.value < 0) {
        return res.status(400).json({
          success: false,
          message: "Discount value must be a positive number",
        });
      }
      if (
        globalDiscount.maxDiscount !== undefined &&
        globalDiscount.maxDiscount < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Maximum discount must be a positive number",
        });
      }
    }

    const store = await Store.findById(req.storeId);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    // Update settings in place
    // We use a helper object to merge updates or set fields directly
    // Ideally, we set fields on store.settings

    if (!store.settings) store.settings = {};

    // Only update fields that are provided
    // Removed: restaurantName, restaurantAddress, restaurantPhone updates
    // These are now top-level Store fields and should be updated via Store CRUD endpoints
    if (restaurantEmail !== undefined)
      store.settings.restaurantEmail = restaurantEmail;
    if (restaurantMotto !== undefined)
      store.settings.restaurantMotto = restaurantMotto;
    if (currency !== undefined) store.settings.currency = currency;
    if (dateFormat !== undefined) store.settings.dateFormat = dateFormat;
    if (lowStockAlert !== undefined)
      store.settings.lowStockAlert = lowStockAlert;
    if (autoGenerateSKU !== undefined)
      store.settings.autoGenerateSKU = autoGenerateSKU;
    if (emailNotifications !== undefined)
      store.settings.emailNotifications = emailNotifications;
    if (timezone !== undefined) store.settings.timezone = timezone;

    // Handle legacy taxRate if still used by frontend, map to taxSettings.globalRate if needed?
    // Or just save it if schema has it (schema didn't have 'taxRate' root field in visible snippet, but maybe it does?)
    // The viewed schema showed `taxSettings`. It didn't show root `taxRate`.
    // Wait, let's check the schema again.
    // Line 29 "Store-Specific Settings"
    // I don't see `taxRate` in the schema snippet I viewed!
    // But original controller used `taxRate`.
    // I will assume `taxSettings.globalRate` is the intended target or I should check if schema has `taxRate` (legacy).
    // The snippet showed `taxSettings` (lines 72-82).
    // I will map `taxRate` to `store.settings.taxSettings.globalRate` if `taxSettings` is not provided,
    // to maintain backward compatibility if the frontend sends `taxRate`.

    if (taxRate !== undefined && !taxSettings) {
      if (!store.settings.taxSettings) store.settings.taxSettings = {};
      store.settings.taxSettings.globalRate = taxRate;
    }

    if (taxSettings) {
      store.settings.taxSettings = {
        ...store.settings.taxSettings,
        ...taxSettings,
      };
    }

    if (serviceCharge) {
      store.settings.serviceCharge = {
        ...store.settings.serviceCharge,
        ...serviceCharge,
      };
    }

    if (globalDiscount) {
      store.settings.globalDiscount = {
        ...store.settings.globalDiscount,
        ...globalDiscount,
      };
    }

    // Handle payment gateway settings
    if (paymentGateways) {
      if (!store.settings.paymentGateways) store.settings.paymentGateways = {};

      // Update Stripe settings if provided
      if (paymentGateways.stripe) {
        store.settings.paymentGateways.stripe = {
          ...store.settings.paymentGateways.stripe,
          enabled: paymentGateways.stripe.enabled,
          publishableKey: paymentGateways.stripe.publishableKey,
          accountId: paymentGateways.stripe.accountId,
        };

        // Only update secretKey if it's provided and not empty
        if (
          paymentGateways.stripe.secretKey &&
          paymentGateways.stripe.secretKey.trim() !== ""
        ) {
          store.settings.paymentGateways.stripe.secretKey =
            paymentGateways.stripe.secretKey;
        }
      }
    }

    // Handle Communication Settings (Modular)
    if (communication) {
      if (!store.settings.communication) store.settings.communication = {};

      ["email", "sms", "whatsapp"].forEach((channel) => {
        if (communication[channel]) {
          const chanUpdate = communication[channel];
          const existingChan = store.settings.communication[channel] || {};

          store.settings.communication[channel] = {
            provider: chanUpdate.provider || existingChan.provider || "log",
            enabled:
              chanUpdate.enabled !== undefined
                ? chanUpdate.enabled
                : existingChan.enabled,
          };

          // Handle Config Map - Merge only non-empty values
          if (chanUpdate.config) {
            // Mongoose Map support: we need to use .set()
            // Ensure config exists
            if (!store.settings.communication[channel].config) {
              store.settings.communication[channel].config = {};
            }

            Object.entries(chanUpdate.config).forEach(([key, val]) => {
              if (val && val.trim() !== "") {
                // If it's a POJO Map, use bracket notation.
                // In Mongoose schema it's type: Map, which behaves like a regular object for assignment but can use .set
                if (
                  typeof store.settings.communication[channel].set ===
                  "function"
                ) {
                  store.settings.communication[channel].config.set(key, val);
                } else {
                  store.settings.communication[channel].config[key] = val;
                }
              }
            });
          }
        }
      });
      // Mark as modified if using Maps
      store.markModified("settings.communication");
    }

    // Handle Printer Settings
    if (printerSettings) {
      store.settings.printerSettings = {
        ...store.settings.printerSettings,
        ...printerSettings,
      };
    }

    await store.save();

    await logAction(
      req.user.id,
      req.storeId,
      req.organizationId,
      "Store",
      req.storeId,
      "update",
      null, // could be old settings diff
      store.settings,
      "Updated store settings",
    );

    res.json({
      success: true,
      message: "Settings updated successfully",
      data: store.settings,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating settings",
    });
  }
};

// @desc    Reset settings to default for current store
// @route   POST /api/settings/reset
// @access  Private
const resetSettings = async (req, res) => {
  try {
    const store = await Store.findById(req.storeId);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    // Reset logic: Simply clear the settings object to enable full brand inheritance
    store.settings = {};

    await store.save();

    await logAction(
      req.user.id,
      req.storeId,
      req.organizationId,
      "Store",
      req.storeId,
      "update",
      null,
      store.settings,
      "Reset store settings to default",
    );

    res.json({
      success: true,
      message: "Settings reset to brand/system defaults successfully",
      data: store.settings,
    });
  } catch (error) {
    console.error("Error resetting settings:", error);
    res.status(500).json({
      success: false,
      message: "Server error while resetting settings",
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  resetSettings,
};


