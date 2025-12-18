// backend/controllers/promoCodeController.js
const PromoCode = require("../models/PromoCode");
const logAction = require("../utils/logAction");
const { validatePromoCode } = require("../utils/discountCalculator");

// Create promo code
const createPromoCode = async (req, res) => {
  try {
    const promoData = req.body;

    // Ensure code is uppercase
    promoData.code = promoData.code.toUpperCase().trim();

    // Check if code already exists (scoped to store)
    const existingCode = await PromoCode.findOne({
      code: promoData.code,
      storeId: req.storeId,
    });
    if (existingCode) {
      return res.status(400).json({
        success: false,
        message: "Promo code already exists",
      });
    }

    // Validate percentage max
    if (
      promoData.discountType === "percentage" &&
      promoData.discountValue > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Percentage discount cannot exceed 100%",
      });
    }

    const promoCode = new PromoCode({
      ...promoData,
      storeId: req.storeId,
      lastAction: {
        action: "create",
        performedBy: req.user.id,
        createdAt: new Date(),
      },
    });

    await promoCode.save();

    await logAction(
      req.user.id,
      req.storeId,
      "PromoCode",
      promoCode._id,
      "create",
      null,
      promoCode,
      `Created promo code: ${promoCode.code}`
    );

    res.status(201).json({
      success: true,
      message: "Promo code created successfully",
      data: promoCode,
    });
  } catch (error) {
    console.error("Error creating promo code:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create promo code",
      error: error.message,
    });
  }
};

// Get all promo codes
const getAllPromoCodes = async (req, res) => {
  try {
    const { active } = req.query;

    const filter = { storeId: req.storeId };
    if (active !== undefined) filter.isActive = active === "true";

    const promoCodes = await PromoCode.find(filter).sort({ createdAt: -1 });

    // Add validity status
    const now = new Date();
    const codesWithStatus = promoCodes.map((code) => {
      const isExpired = code.endDate && now > new Date(code.endDate);
      const isNotStarted = code.startDate && now < new Date(code.startDate);
      const usageLimitReached =
        code.usageLimit !== null && code.usageCount >= code.usageLimit;

      return {
        ...code.toObject(),
        status: !code.isActive
          ? "inactive"
          : isExpired
          ? "expired"
          : isNotStarted
          ? "scheduled"
          : usageLimitReached
          ? "exhausted"
          : "active",
      };
    });

    res.status(200).json({
      success: true,
      count: promoCodes.length,
      data: codesWithStatus,
    });
  } catch (error) {
    console.error("Error fetching promo codes:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch promo codes",
      error: error.message,
    });
  }
};

// Get single promo code
const getPromoCodeById = async (req, res) => {
  try {
    const promoCode = await PromoCode.findOne({
      _id: req.params.id,
      storeId: req.storeId,
    });

    if (!promoCode) {
      return res.status(404).json({
        success: false,
        message: "Promo code not found",
      });
    }

    res.status(200).json({
      success: true,
      data: promoCode,
    });
  } catch (error) {
    console.error("Error fetching promo code:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch promo code",
      error: error.message,
    });
  }
};

// Validate promo code (for POS)
const validateCode = async (req, res) => {
  try {
    const { code, orderAmount, orderType, customerId } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Promo code is required",
      });
    }

    const result = await validatePromoCode(
      code,
      orderAmount || 0,
      orderType || "dine-in",
      customerId
    );

    if (!result.valid) {
      return res.status(400).json({
        success: false,
        message: result.error,
      });
    }

    res.status(200).json({
      success: true,
      message: "Promo code is valid",
      data: {
        code: result.promoCode.code,
        discountType: result.discountType,
        discountValue: result.discountValue,
        discountAmount: result.discountAmount,
        description: result.promoCode.description,
        minimumOrderAmount: result.promoCode.minimumOrderAmount,
        maximumDiscountAmount: result.promoCode.maximumDiscountAmount,
      },
    });
  } catch (error) {
    console.error("Error validating promo code:", error);
    res.status(500).json({
      success: false,
      message: "Failed to validate promo code",
      error: error.message,
    });
  }
};

// Update promo code
const updatePromoCode = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Ensure code is uppercase if being updated
    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase().trim();

      // Check if new code already exists (excluding current, scoped to store)
      const existingCode = await PromoCode.findOne({
        code: updateData.code,
        storeId: req.storeId,
        _id: { $ne: id },
      });
      if (existingCode) {
        return res.status(400).json({
          success: false,
          message: "Promo code already exists",
        });
      }
    }

    const oldPromoCode = await PromoCode.findOne({
      _id: id,
      storeId: req.storeId,
    });
    if (!oldPromoCode) {
      return res.status(404).json({
        success: false,
        message: "Promo code not found",
      });
    }

    const promoCode = await PromoCode.findOneAndUpdate(
      { _id: id, storeId: req.storeId },
      {
        ...updateData,
        lastAction: {
          action: "update",
          performedBy: req.user.id,
          createdAt: new Date(),
        },
      },
      { new: true, runValidators: true }
    );

    await logAction(
      req.user.id,
      req.storeId,
      "PromoCode",
      promoCode._id,
      "edit",
      oldPromoCode,
      promoCode,
      `Updated promo code: ${promoCode.code}`
    );

    res.status(200).json({
      success: true,
      message: "Promo code updated successfully",
      data: promoCode,
    });
  } catch (error) {
    console.error("Error updating promo code:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update promo code",
      error: error.message,
    });
  }
};

// Delete promo code
const deletePromoCode = async (req, res) => {
  try {
    const { id } = req.params;

    const promoCode = await PromoCode.findOne({
      _id: id,
      storeId: req.storeId,
    });
    if (!promoCode) {
      return res.status(404).json({
        success: false,
        message: "Promo code not found",
      });
    }

    await PromoCode.findOneAndDelete({ _id: id, storeId: req.storeId });

    await logAction(
      req.user.id,
      req.storeId,
      "PromoCode",
      id,
      "delete",
      promoCode,
      null,
      `Deleted promo code: ${promoCode.code}`
    );

    res.status(200).json({
      success: true,
      message: "Promo code deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting promo code:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete promo code",
      error: error.message,
    });
  }
};

// Toggle promo code active status
const togglePromoCodeStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const promoCode = await PromoCode.findOne({
      _id: id,
      storeId: req.storeId,
    });
    if (!promoCode) {
      return res.status(404).json({
        success: false,
        message: "Promo code not found",
      });
    }

    promoCode.isActive = !promoCode.isActive;
    promoCode.lastAction = {
      action: "update",
      performedBy: req.user.id,
      createdAt: new Date(),
    };

    await promoCode.save();

    res.status(200).json({
      success: true,
      message: `Promo code ${
        promoCode.isActive ? "activated" : "deactivated"
      } successfully`,
      data: promoCode,
    });
  } catch (error) {
    console.error("Error toggling promo code status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle promo code status",
      error: error.message,
    });
  }
};

module.exports = {
  createPromoCode,
  getAllPromoCodes,
  getPromoCodeById,
  validateCode,
  updatePromoCode,
  deletePromoCode,
  togglePromoCodeStatus,
};
