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

    let settings = await GeneralSettings.findOne();

    if (!settings) {
      // Create new settings if they don't exist
      settings = new GeneralSettings({
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
      });
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
