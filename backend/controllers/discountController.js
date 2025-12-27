// backend/controllers/discountController.js
const Discount = require("../models/Discount");
const logAction = require("../utils/logAction");
const {
  getActiveHappyHourDiscounts,
  isDiscountActive,
} = require("../utils/discountCalculator");

// Create discount
const createDiscount = async (req, res) => {
  try {
    const discountData = req.body;

    // Validate percentage max
    if (discountData.type === "percentage" && discountData.value > 100) {
      return res.status(400).json({
        success: false,
        message: "Percentage discount cannot exceed 100%",
      });
    }

    const discount = new Discount({
      ...discountData,
      storeId: req.storeId,
      lastAction: {
        action: "create",
        performedBy: req.user.id,
        createdAt: new Date(),
      },
    });

    await discount.save();

    await logAction(
      req.user.id,
      req.storeId,
      req.organizationId,
      "Discount",
      discount._id,
      "create",
      null,
      discount,
      `Created discount: ${discount.name}`
    );

    res.status(201).json({
      success: true,
      message: "Discount created successfully",
      data: discount,
    });
  } catch (error) {
    console.error("Error creating discount:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create discount",
      error: error.message,
    });
  }
};

// Get all discounts
const getAllDiscounts = async (req, res) => {
  try {
    const { active, type, isHappyHour } = req.query;

    const filter = { storeId: req.storeId };
    if (active !== undefined) filter.isActive = active === "true";
    if (type) filter.type = type;
    if (isHappyHour !== undefined) filter.isHappyHour = isHappyHour === "true";

    const discounts = await Discount.find(filter)
      .populate("applicableItems", "name price")
      .populate("bogoConfig.applicableItems", "name price")
      .sort({ createdAt: -1 });

    // Add computed "currentlyActive" status
    const discountsWithStatus = discounts.map((d) => ({
      ...d.toObject(),
      currentlyActive: isDiscountActive(d),
    }));

    res.status(200).json({
      success: true,
      count: discounts.length,
      data: discountsWithStatus,
    });
  } catch (error) {
    console.error("Error fetching discounts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch discounts",
      error: error.message,
    });
  }
};

// Get single discount
const getDiscountById = async (req, res) => {
  try {
    const discount = await Discount.findOne({
      _id: req.params.id,
      storeId: req.storeId,
    })
      .populate("applicableItems", "name price category")
      .populate("bogoConfig.applicableItems", "name price category");

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: "Discount not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...discount.toObject(),
        currentlyActive: isDiscountActive(discount),
      },
    });
  } catch (error) {
    console.error("Error fetching discount:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch discount",
      error: error.message,
    });
  }
};

// Update discount
const updateDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate percentage max
    if (updateData.type === "percentage" && updateData.value > 100) {
      return res.status(400).json({
        success: false,
        message: "Percentage discount cannot exceed 100%",
      });
    }

    const oldDiscount = await Discount.findOne({
      _id: id,
      storeId: req.storeId,
    });
    if (!oldDiscount) {
      return res.status(404).json({
        success: false,
        message: "Discount not found",
      });
    }

    const discount = await Discount.findOneAndUpdate(
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
      req.organizationId,
      "Discount",
      discount._id,
      "edit",
      oldDiscount,
      discount,
      `Updated discount: ${discount.name}`
    );

    res.status(200).json({
      success: true,
      message: "Discount updated successfully",
      data: discount,
    });
  } catch (error) {
    console.error("Error updating discount:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update discount",
      error: error.message,
    });
  }
};

// Delete discount
const deleteDiscount = async (req, res) => {
  try {
    const { id } = req.params;

    const discount = await Discount.findOne({ _id: id, storeId: req.storeId });
    if (!discount) {
      return res.status(404).json({
        success: false,
        message: "Discount not found",
      });
    }

    await Discount.findOneAndDelete({ _id: id, storeId: req.storeId });

    await logAction(
      req.user.id,
      req.storeId,
      req.organizationId,
      "Discount",
      id,
      "delete",
      discount,
      null,
      `Deleted discount: ${discount.name}`
    );

    res.status(200).json({
      success: true,
      message: "Discount deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting discount:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete discount",
      error: error.message,
    });
  }
};

// Get active discounts for POS
const getActiveDiscountsForPOS = async (req, res) => {
  try {
    const { orderType = "dine-in" } = req.query;

    // Get all active discounts (scoped to store)
    const discounts = await Discount.find({
      isActive: true,
      storeId: req.storeId,
    })
      .populate("applicableItems", "name price")
      .populate("bogoConfig.applicableItems", "name price");

    // Filter by currently active and order type
    const activeDiscounts = discounts.filter((d) => {
      if (!isDiscountActive(d)) return false;
      if (!d.applicableOrderTypes.includes(orderType)) return false;
      return true;
    });

    // Separate happy hour from regular
    const happyHourDiscounts = activeDiscounts.filter((d) => d.isHappyHour);
    const regularDiscounts = activeDiscounts.filter((d) => !d.isHappyHour);

    res.status(200).json({
      success: true,
      data: {
        happyHour: happyHourDiscounts,
        regular: regularDiscounts,
        all: activeDiscounts,
      },
    });
  } catch (error) {
    console.error("Error fetching active discounts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch active discounts",
      error: error.message,
    });
  }
};

// Toggle discount active status
const toggleDiscountStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const discount = await Discount.findOne({ _id: id, storeId: req.storeId });
    if (!discount) {
      return res.status(404).json({
        success: false,
        message: "Discount not found",
      });
    }

    discount.isActive = !discount.isActive;
    discount.lastAction = {
      action: "update",
      performedBy: req.user.id,
      createdAt: new Date(),
    };

    await discount.save();

    res.status(200).json({
      success: true,
      message: `Discount ${
        discount.isActive ? "activated" : "deactivated"
      } successfully`,
      data: discount,
    });
  } catch (error) {
    console.error("Error toggling discount status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle discount status",
      error: error.message,
    });
  }
};

module.exports = {
  createDiscount,
  getAllDiscounts,
  getDiscountById,
  updateDiscount,
  deleteDiscount,
  getActiveDiscountsForPOS,
  toggleDiscountStatus,
};
