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
        companyName: "Your Company",
        companyAddress: "",
        companyPhone: "",
        companyEmail: "",
        companyMotto: "",
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
      companyName,
      companyAddress,
      companyPhone,
      companyEmail,
      companyMotto,
      currency,
      dateFormat,
      lowStockAlert,
      autoGenerateSKU,
      taxRate,
      emailNotifications,
      timezone,
    } = req.body;

    // Validate required fields
    if (!companyName || companyName.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Company name is required",
      });
    }

    if (!companyAddress || companyAddress.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Company address is required",
      });
    }

    if (!companyPhone || companyPhone.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Company phone number is required",
      });
    }

    if (!companyEmail || companyEmail.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Company email is required",
      });
    }

    // Validate email format
    if (!emailRegex.test(companyEmail)) {
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
        companyName,
        companyAddress,
        companyPhone,
        companyEmail,
        companyMotto: companyMotto || "",
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
      settings.companyName = companyName;
      settings.companyAddress = companyAddress;
      settings.companyPhone = companyPhone;
      settings.companyEmail = companyEmail;
      settings.companyMotto = companyMotto || "";
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
    settings.companyName = "Your Company";
    settings.companyAddress = "";
    settings.companyPhone = "";
    settings.companyEmail = "";
    settings.companyMotto = "";
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
