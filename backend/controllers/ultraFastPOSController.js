// backend/controllers/ultraFastPOSController.js
const UltraFastPOSSettings = require("../models/UltraFastPOSSettings");

const DEFAULT_SHORTCUTS = {
  finalizeSale: "f9",
  cancelSale: "escape",
  voidLastItem: "backspace",
  category1: "1",
  category2: "2",
  category3: "3",
  category4: "4",
  category5: "5",
  category6: "6",
  category7: "7",
  category8: "8",
  category9: "9",
  searchItem: "ctrl+f",
  openCalculator: "ctrl+c",
  reprintLast: "ctrl+p",
  customerLookup: "ctrl+k",
  applyDiscount: "ctrl+d",
  payCash: "f1",
  payCard: "f2",
  payTransfer: "f3",
};

// Get keyboard settings
exports.getKeyboardSettings = async (req, res) => {
  try {
    let settings = await UltraFastPOSSettings.findOne({
      userId: req.user.id,
      storeId: req.storeId,
    });

    if (!settings) {
      settings = await UltraFastPOSSettings.create({
        userId: req.user.id,
        storeId: req.storeId,
        keyboardShortcuts: DEFAULT_SHORTCUTS,
      });
    }

    res.status(200).json({
      success: true,
      data: settings.keyboardShortcuts,
    });
  } catch (error) {
    console.error("Error fetching keyboard settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch keyboard settings",
    });
  }
};

// Update keyboard settings
exports.updateKeyboardSettings = async (req, res) => {
  try {
    const { settings } = req.body;

    if (!settings) {
      return res.status(400).json({
        success: false,
        message: "Settings are required",
      });
    }

    // Validate no duplicate shortcuts
    const shortcuts = Object.values(settings);
    const uniqueShortcuts = new Set(shortcuts);

    if (shortcuts.length !== uniqueShortcuts.size) {
      return res.status(400).json({
        success: false,
        message: "Duplicate shortcuts detected",
      });
    }

    let userSettings = await UltraFastPOSSettings.findOne({
      userId: req.user.id,
      storeId: req.storeId,
    });

    if (!userSettings) {
      userSettings = await UltraFastPOSSettings.create({
        userId: req.user.id,
        storeId: req.storeId,
        keyboardShortcuts: settings,
      });
    } else {
      userSettings.keyboardShortcuts = settings;
      await userSettings.save();
    }

    res.status(200).json({
      success: true,
      data: userSettings.keyboardShortcuts,
      message: "Keyboard settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating keyboard settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update keyboard settings",
    });
  }
};

// Reset to defaults
exports.resetKeyboardSettings = async (req, res) => {
  try {
    let userSettings = await UltraFastPOSSettings.findOne({
      userId: req.user.id,
      storeId: req.storeId,
    });

    if (!userSettings) {
      userSettings = await UltraFastPOSSettings.create({
        userId: req.user.id,
        storeId: req.storeId,
        keyboardShortcuts: DEFAULT_SHORTCUTS,
      });
    } else {
      userSettings.keyboardShortcuts = DEFAULT_SHORTCUTS;
      await userSettings.save();
    }

    res.status(200).json({
      success: true,
      data: userSettings.keyboardShortcuts,
      message: "Keyboard settings reset to defaults",
    });
  } catch (error) {
    console.error("Error resetting keyboard settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset keyboard settings",
    });
  }
};
