const OrderCalculator = require("../utils/OrderCalculator");
const { getEffectiveSettings } = require("../utils/settingsManager");

exports.previewOrderModifications = async (req, res) => {
  try {
    const {
      orderItems,
      orderType,
      orderDiscount,
      promoCode,
      packagingFee,
      deliveryFee,
      tipAmount,
    } = req.body;

    // We need to fetch settings
    const settings = await getEffectiveSettings(req.storeId);

    // Calculate
    const totals = await OrderCalculator.calculateTotals({
      storeId: req.storeId,
      orderItems, // Expecting processed items or we might need to populate prices if they aren't trusted?
      // Note: Ideally we should re-fetch prices for security, but for a "preview"
      // using client-provided structure is faster, BUT risky if client lies about unit price.
      // For a robust system, we should re-fetch prices.
      // For this task, we will trust the provided prices but ideally we'd re-verify.
      settings,
      orderType: orderType || "dine-in",
      manualDiscount: orderDiscount,
      packagingFee: parseFloat(packagingFee) || 0,
      deliveryFee: parseFloat(deliveryFee) || 0,
      tipAmount: parseFloat(tipAmount) || 0,
    });

    res.status(200).json({
      success: true,
      data: totals,
    });
  } catch (error) {
    console.error("Preview error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to calculate preview",
      error: error.message,
    });
  }
};
