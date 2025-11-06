const InventoryItem = require("../models/InventoryItem");
const MenuItem = require("../models/MenuItem");
const logAction = require("../utils/logAction");

// Get all inventory items
exports.getAllInventoryItems = async (req, res) => {
  try {
    const { category, lowStock } = req.query;

    let filter = { isActive: true };

    if (category) filter.category = category;
    if (lowStock === "true") {
      filter.$expr = { $lte: ["$currentStock", "$minStockLevel"] };
    }

    const items = await InventoryItem.find(filter)
      .populate("supplier", "name phone email")
      .populate("linkedMenuItems.menuItemId", "name")
      .populate("lastAction.performedBy", "fullname")
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    console.error("Error fetching inventory items:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch inventory items",
      error: error.message,
    });
  }
};

// Get single inventory item
exports.getInventoryItemById = async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id)
      .populate("supplier", "name phone email")
      .populate("linkedMenuItems.menuItemId", "name price")
      .populate("lastAction.performedBy", "fullname");

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error("Error fetching inventory item:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch inventory item",
      error: error.message,
    });
  }
};

// Create inventory item
exports.createInventoryItem = async (req, res) => {
  try {
    const {
      name,
      sku,
      category,
      unit,
      currentStock,
      minStockLevel,
      costPrice,
      linkedMenuItems,
      supplier,
      notes,
    } = req.body;

    // Validate required fields
    if (!name || !category || !unit || costPrice === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Check for duplicate SKU if provided
    if (sku) {
      const existingItem = await InventoryItem.findOne({ sku });
      if (existingItem) {
        return res.status(400).json({
          success: false,
          message: "An item with this SKU already exists",
        });
      }
    }

    const inventoryItem = await InventoryItem.create({
      name,
      sku,
      category,
      unit,
      currentStock: currentStock || 0,
      minStockLevel: minStockLevel || 0,
      costPrice,
      linkedMenuItems: linkedMenuItems || [],
      supplier,
      notes,
      lastRestockDate: currentStock > 0 ? new Date() : null,
    });

    // Log the action
    await logAction(
      req.user.id,
      "InventoryItem",
      inventoryItem._id,
      "create",
      null,
      inventoryItem,
      `Created inventory item: ${name}`
    );

    const populatedItem = await InventoryItem.findById(inventoryItem._id)
      .populate("supplier", "name phone email")
      .populate("linkedMenuItems.menuItemId", "name");

    res.status(201).json({
      success: true,
      message: "Inventory item created successfully",
      data: populatedItem,
    });
  } catch (error) {
    console.error("Error creating inventory item:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create inventory item",
      error: error.message,
    });
  }
};

// Update inventory item
exports.updateInventoryItem = async (req, res) => {
  try {
    const oldItem = await InventoryItem.findById(req.params.id);

    if (!oldItem) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    // Check for SKU conflicts if updating SKU
    if (req.body.sku && req.body.sku !== oldItem.sku) {
      const existingItem = await InventoryItem.findOne({
        sku: req.body.sku,
        _id: { $ne: req.params.id },
      });

      if (existingItem) {
        return res.status(400).json({
          success: false,
          message: "An item with this SKU already exists",
        });
      }
    }

    const updatedItem = await InventoryItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("supplier", "name phone email")
      .populate("linkedMenuItems.menuItemId", "name");

    // Log the action
    await logAction(
      req.user.id,
      "InventoryItem",
      req.params.id,
      "update",
      oldItem,
      updatedItem,
      req.body.reason || `Updated inventory item: ${updatedItem.name}`
    );

    res.status(200).json({
      success: true,
      message: "Inventory item updated successfully",
      data: updatedItem,
    });
  } catch (error) {
    console.error("Error updating inventory item:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update inventory item",
      error: error.message,
    });
  }
};

// Delete inventory item (soft delete)
exports.deleteInventoryItem = async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    // Soft delete by setting isActive to false
    item.isActive = false;
    await item.save();

    // Log the action
    await logAction(
      req.user.id,
      "InventoryItem",
      req.params.id,
      "delete",
      item,
      null,
      `Deleted inventory item: ${item.name}`
    );

    res.status(200).json({
      success: true,
      message: "Inventory item deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete inventory item",
      error: error.message,
    });
  }
};

// Get low stock items
exports.getLowStockItems = async (req, res) => {
  try {
    const items = await InventoryItem.find({
      isActive: true,
      $expr: { $lte: ["$currentStock", "$minStockLevel"] },
    })
      .populate("supplier", "name phone email")
      .sort({ currentStock: 1 });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    console.error("Error fetching low stock items:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch low stock items",
      error: error.message,
    });
  }
};

// Link inventory item to menu item
exports.linkToMenuItem = async (req, res) => {
  try {
    const { menuItemId, quantityUsed } = req.body;

    if (!menuItemId || !quantityUsed) {
      return res.status(400).json({
        success: false,
        message: "Menu item ID and quantity used are required",
      });
    }

    const inventoryItem = await InventoryItem.findById(req.params.id);
    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    // Check if already linked
    const existingLink = inventoryItem.linkedMenuItems.find(
      (link) => link.menuItemId.toString() === menuItemId
    );

    if (existingLink) {
      existingLink.quantityUsed = quantityUsed;
    } else {
      inventoryItem.linkedMenuItems.push({
        menuItemId,
        quantityUsed,
      });
    }

    await inventoryItem.save();

    const populatedItem = await InventoryItem.findById(inventoryItem._id)
      .populate("supplier", "name phone email")
      .populate("linkedMenuItems.menuItemId", "name price");

    res.status(200).json({
      success: true,
      message: "Menu item linked successfully",
      data: populatedItem,
    });
  } catch (error) {
    console.error("Error linking menu item:", error);
    res.status(500).json({
      success: false,
      message: "Failed to link menu item",
      error: error.message,
    });
  }
};

// Unlink menu item
exports.unlinkMenuItem = async (req, res) => {
  try {
    const { menuItemId } = req.params;

    const inventoryItem = await InventoryItem.findById(req.params.id);
    if (!inventoryItem) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    inventoryItem.linkedMenuItems = inventoryItem.linkedMenuItems.filter(
      (link) => link.menuItemId.toString() !== menuItemId
    );

    await inventoryItem.save();

    const populatedItem = await InventoryItem.findById(inventoryItem._id)
      .populate("supplier", "name phone email")
      .populate("linkedMenuItems.menuItemId", "name price");

    res.status(200).json({
      success: true,
      message: "Menu item unlinked successfully",
      data: populatedItem,
    });
  } catch (error) {
    console.error("Error unlinking menu item:", error);
    res.status(500).json({
      success: false,
      message: "Failed to unlink menu item",
      error: error.message,
    });
  }
};

module.exports = exports;
