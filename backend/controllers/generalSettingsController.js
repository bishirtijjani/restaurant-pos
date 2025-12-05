const GeneralSettings = require("../models/GeneralSettings");

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// @desc    Get general settings
// @route   GET /api/settings
// @access  Private
const getSettings = async (req, res) => {
  try {
    let settings = await GeneralSettings.findOne();

    // If no settings exist, create default settings
    if (!settings) {
      settings = new GeneralSettings({
        restaurantName: "Your Restaurant",
        restaurantAddress: "",
        restaurantPhone: "",
        restaurantEmail: "",
        restaurantMotto: "",
        currency: {
          code: "USD",
          name: "US Dollar",
          symbol: "$",
        },
        dateFormat: "MM/DD/YYYY",
        lowStockAlert: 10,
        autoGenerateSKU: true,
        taxRate: 0,
        emailNotifications: true,
        timezone: "America/New_York",
      });
      await settings.save();
    }

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching settings",
    });
  }
};

// @desc    Update general settings
// @route   PUT /api/settings
// @access  Private
const updateSettings = async (req, res) => {
  try {
    const {
      restaurantName,
      restaurantAddress,
      restaurantPhone,
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
    } = req.body;

    // Validate required fields
    if (!restaurantName || restaurantName.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Restaurant name is required",
      });
    }

    if (!restaurantAddress || restaurantAddress.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Restaurant address is required",
      });
    }

    if (!restaurantPhone || restaurantPhone.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Restaurant phone number is required",
      });
    }

    if (!restaurantEmail || restaurantEmail.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Restaurant email is required",
      });
    }

    // Validate email format
    if (!emailRegex.test(restaurantEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // Validate currency object
    if (!currency || !currency.code || !currency.name || !currency.symbol) {
      return res.status(400).json({
        success: false,
        message: "Currency information is incomplete",
      });
    }

    // Validate tax rate
    if (taxRate < 0 || taxRate > 100) {
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
      if (taxSettings.globalRate !== undefined && (taxSettings.globalRate < 0 || taxSettings.globalRate > 100)) {
        return res.status(400).json({
          success: false,
          message: "Tax rate must be between 0 and 100",
        });
      }
    }

    // Validate serviceCharge if provided
    if (serviceCharge) {
      if (serviceCharge.rate !== undefined && (serviceCharge.rate < 0 || serviceCharge.rate > 100)) {
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
      if (globalDiscount.maxDiscount !== undefined && globalDiscount.maxDiscount < 0) {
        return res.status(400).json({
          success: false,
          message: "Maximum discount must be a positive number",
        });
      }
    }

    let settings = await GeneralSettings.findOne();

    if (!settings) {
      // Create new settings if they don't exist
      const newSettingsData = {
        restaurantName,
        restaurantAddress,
        restaurantPhone,
        restaurantEmail,
        restaurantMotto: restaurantMotto || "",
        currency,
        dateFormat,
        lowStockAlert,
        autoGenerateSKU,
        taxRate,
        emailNotifications,
        timezone,
      };
      
      // Add optional fields if provided
      if (taxSettings) newSettingsData.taxSettings = taxSettings;
      if (serviceCharge) newSettingsData.serviceCharge = serviceCharge;
      if (globalDiscount) newSettingsData.globalDiscount = globalDiscount;
      
      settings = new GeneralSettings(newSettingsData);
    } else {
      // Update existing settings
      settings.restaurantName = restaurantName;
      settings.restaurantAddress = restaurantAddress;
      settings.restaurantPhone = restaurantPhone;
      settings.restaurantEmail = restaurantEmail;
      settings.restaurantMotto = restaurantMotto || "";
      settings.currency = currency;
      settings.dateFormat = dateFormat;
      settings.lowStockAlert = lowStockAlert;
      settings.autoGenerateSKU = autoGenerateSKU;
      settings.taxRate = taxRate;
      settings.emailNotifications = emailNotifications;
      settings.timezone = timezone;
      
      // Update tax settings if provided
      if (taxSettings) {
        settings.taxSettings = taxSettings;
      }
      
      // Update service charge if provided
      if (serviceCharge) {
        settings.serviceCharge = serviceCharge;
      }
      
      // Update global discount if provided
      if (globalDiscount) {
        settings.globalDiscount = globalDiscount;
      }
    }

    await settings.save();

    res.json({
      success: true,
      message: "Settings updated successfully",
      data: settings,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating settings",
    });
  }
};

// @desc    Reset settings to default
// @route   POST /api/settings/reset
// @access  Private
const resetSettings = async (req, res) => {
  try {
    let settings = await GeneralSettings.findOne();

    if (!settings) {
      settings = new GeneralSettings();
    }

    // Reset to default values
    settings.restaurantName = "Your Restaurant";
    settings.restaurantAddress = "";
    settings.restaurantPhone = "";
    settings.restaurantEmail = "";
    settings.restaurantMotto = "";
    settings.currency = {
      code: "USD",
      name: "US Dollar",
      symbol: "$",
    };
    settings.dateFormat = "MM/DD/YYYY";
    settings.lowStockAlert = 10;
    settings.autoGenerateSKU = true;
    settings.taxRate = 0;
    settings.emailNotifications = true;
    settings.timezone = "America/New_York";
    
    // Reset tax settings to defaults
    settings.taxSettings = {
      enabled: true,
      globalRate: 7.5,
      name: "VAT",
      mode: "per-item",
      includeInPrice: false,
    };
    
    // Reset service charge to defaults
    settings.serviceCharge = {
      enabled: false,
      rate: 0,
      name: "Service Charge",
      applyTo: "dine-in",
    };
    
    // Reset global discount to defaults
    settings.globalDiscount = {
      enabled: false,
      name: "Store Discount",
      type: "percentage",
      value: 0,
      maxDiscount: null,
      applicableOrderTypes: ["dine-in", "takeaway", "delivery"],
      minimumOrderAmount: 0,
    };

    await settings.save();

    res.json({
      success: true,
      message: "Settings reset to defaults successfully",
      data: settings,
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
