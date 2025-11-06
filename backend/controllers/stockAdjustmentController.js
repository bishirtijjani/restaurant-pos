const StockAdjustment = require("../models/StockAdjustment");
const InventoryItem = require("../models/InventoryItem");

// Get all stock adjustments
exports.getAllStockAdjustments = async (req, res) => {
  try {
    const { inventoryItem, type, startDate, endDate } = req.query;

    let filter = {};

    if (inventoryItem) filter.inventoryItem = inventoryItem;
    if (type) filter.type = type;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const adjustments = await StockAdjustment.find(filter)
      .populate("inventoryItem", "name unit sku")
      .populate("performedBy", "fullname")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: adjustments.length,
      data: adjustments,
    });
  } catch (error) {
    console.error("Error fetching stock adjustments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch stock adjustments",
      error: error.message,
    });
  }
};

// Get single stock adjustment
exports.getStockAdjustmentById = async (req, res) => {
  try {
    const adjustment = await StockAdjustment.findById(req.params.id)
      .populate("inventoryItem", "name unit sku category")
      .populate("performedBy", "fullname email");

    if (!adjustment) {
      return res.status(404).json({
        success: false,
        message: "Stock adjustment not found",
      });
    }

    res.status(200).json({
      success: true,
      data: adjustment,
    });
  } catch (error) {
    console.error("Error fetching stock adjustment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch stock adjustment",
      error: error.message,
    });
  }
};

// Create stock adjustment
exports.createStockAdjustment = async (req, res) => {
  try {
    const { inventoryItem, type, reason, quantity, notes } = req.body;

    // Validate required fields
    if (!inventoryItem || !type || !reason || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Get inventory item
    const item = await InventoryItem.findById(inventoryItem);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    const previousStock = item.currentStock;
    let newStock;

    // Calculate new stock based on adjustment type
    switch (type) {
      case "addition":
        newStock = previousStock + quantity;
        break;
      case "subtraction":
        newStock = previousStock - quantity;
        if (newStock < 0) {
          return res.status(400).json({
            success: false,
            message: "Insufficient stock for this adjustment",
          });
        }
        break;
      case "correction":
        newStock = quantity; // Direct correction to specific amount
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid adjustment type",
        });
    }

    // Create adjustment record
    const adjustment = await StockAdjustment.create({
      inventoryItem,
      type,
      reason,
      quantity: Math.abs(
        type === "correction" ? newStock - previousStock : quantity
      ),
      previousStock,
      newStock,
      notes,
      performedBy: req.user.id,
    });

    // Update inventory item stock
    item.currentStock = newStock;
    await item.save();

    const populatedAdjustment = await StockAdjustment.findById(adjustment._id)
      .populate("inventoryItem", "name unit sku")
      .populate("performedBy", "fullname");

    res.status(201).json({
      success: true,
      message: "Stock adjustment created successfully",
      data: populatedAdjustment,
    });
  } catch (error) {
    console.error("Error creating stock adjustment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create stock adjustment",
      error: error.message,
    });
  }
};

// Get adjustments by inventory item
exports.getAdjustmentsByItem = async (req, res) => {
  try {
    const adjustments = await StockAdjustment.find({
      inventoryItem: req.params.itemId,
    })
      .populate("performedBy", "fullname")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: adjustments.length,
      data: adjustments,
    });
  } catch (error) {
    console.error("Error fetching adjustments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch adjustments",
      error: error.message,
    });
  }
};

module.exports = exports;
