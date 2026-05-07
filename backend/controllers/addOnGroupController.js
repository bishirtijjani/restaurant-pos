// backend/controllers/addOnGroupController.js
const AddOnGroup = require("../models/AddOnGroup");
const MenuItem = require("../models/MenuItem");
const logAction = require("../utils/logAction");

// Get all add-on groups
exports.getAllAddOnGroups = async (req, res) => {
  try {
    const { isActive } = req.query;

    let filter = { storeId: req.storeId };
    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    const groups = await AddOnGroup.find(filter)
      .populate("items.inventoryItem", "name unit currentStock")
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: groups.length,
      data: groups,
    });
  } catch (error) {
    console.error("Error fetching add-on groups:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch add-on groups",
      error: error.message,
    });
  }
};

// Get single add-on group
exports.getAddOnGroupById = async (req, res) => {
  try {
    const group = await AddOnGroup.findOne({
      _id: req.params.id,
      storeId: req.storeId,
    }).populate("items.inventoryItem", "name unit currentStock");

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Add-on group not found",
      });
    }

    res.status(200).json({
      success: true,
      data: group,
    });
  } catch (error) {
    console.error("Error fetching add-on group:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch add-on group",
      error: error.message,
    });
  }
};

// Create add-on group
exports.createAddOnGroup = async (req, res) => {
  try {
    const {
      name,
      description,
      items,
      selectionType,
      isRequired,
      minSelections,
      maxSelections,
    } = req.body;

    // Validate required fields
    if (!name || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Name and at least one add-on item are required",
      });
    }

    // Validate items
    for (const item of items) {
      if (!item.name) {
        return res.status(400).json({
          success: false,
          message: "Each add-on item must have a name",
        });
      }
      if (item.price === undefined || item.price < 0) {
        return res.status(400).json({
          success: false,
          message: "Each add-on item must have a valid price",
        });
      }
    }

    // Validate selection rules
    if (isRequired && minSelections < 1) {
      return res.status(400).json({
        success: false,
        message: "Required groups must have minSelections >= 1",
      });
    }

    if (
      selectionType === "single" &&
      maxSelections !== null &&
      maxSelections > 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Single selection type cannot have maxSelections > 1",
      });
    }

    const addOnGroup = await AddOnGroup.create({
      name,
      description,
      storeId: req.storeId,
      organizationId: req.organizationId,
      items: items.map((item) => ({
        name: item.name,
        price: parseFloat(item.price) || 0,
        isAvailable: item.isAvailable !== false,
        inventoryItem: item.inventoryItem || null,
        quantityUsed: item.quantityUsed || 1,
        allergens: item.allergens || [],
        dietaryTags: item.dietaryTags || [],
      })),
      selectionType: selectionType || "single",
      isRequired: isRequired || false,
      minSelections: minSelections || 0,
      maxSelections: selectionType === "single" ? 1 : maxSelections || null,
    });

    // Log the action
    await logAction(
      req.user.id,
      req.storeId,
      req.organizationId,
      "AddOnGroup",
      addOnGroup._id,
      "create",
      null,
      addOnGroup,
      `Created add-on group: ${name}`
    );

    const populatedGroup = await AddOnGroup.findById(addOnGroup._id).populate(
      "items.inventoryItem",
      "name unit"
    );

    res.status(201).json({
      success: true,
      message: "Add-on group created successfully",
      data: populatedGroup,
    });
  } catch (error) {
    console.error("Error creating add-on group:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create add-on group",
      error: error.message,
    });
  }
};

// Update add-on group
exports.updateAddOnGroup = async (req, res) => {
  try {
    const oldGroup = await AddOnGroup.findOne({
      _id: req.params.id,
      storeId: req.storeId,
    });

    if (!oldGroup) {
      return res.status(404).json({
        success: false,
        message: "Add-on group not found",
      });
    }

    // FIELD LOCKING: Prevent store-level editing of brand-synced add-on groups
    if (oldGroup.masterId) {
      return res.status(403).json({
        success: false,
        message:
          "Cannot modify a brand-controlled add-on group. Edit it from the Master Menu in the Brand Dashboard.",
      });
    }

    const {
      name,
      description,
      items,
      selectionType,
      isRequired,
      minSelections,
      maxSelections,
      isActive,
    } = req.body;

    // Validate if items are provided
    if (items && items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Add-on group must have at least one item",
      });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (selectionType !== undefined) updateData.selectionType = selectionType;
    if (isRequired !== undefined) updateData.isRequired = isRequired;
    if (minSelections !== undefined) updateData.minSelections = minSelections;
    if (maxSelections !== undefined) updateData.maxSelections = maxSelections;
    if (isActive !== undefined) updateData.isActive = isActive;

    if (items) {
      updateData.items = items.map((item) => ({
        _id: item._id || undefined,
        name: item.name,
        price: parseFloat(item.price) || 0,
        isAvailable: item.isAvailable !== false,
        inventoryItem: item.inventoryItem || null,
        quantityUsed: item.quantityUsed || 1,
        allergens: item.allergens || [],
        dietaryTags: item.dietaryTags || [],
      }));
    }

    const updatedGroup = await AddOnGroup.findOneAndUpdate(
      { _id: req.params.id, storeId: req.storeId },
      updateData,
      { new: true, runValidators: true }
    ).populate("items.inventoryItem", "name unit");

    // Log the action
    await logAction(
      req.user.id,
      req.storeId,
      req.organizationId,
      "AddOnGroup",
      req.params.id,
      "update",
      oldGroup,
      updatedGroup,
      req.body.reason || `Updated add-on group: ${updatedGroup.name}`
    );

    res.status(200).json({
      success: true,
      message: "Add-on group updated successfully",
      data: updatedGroup,
    });
  } catch (error) {
    console.error("Error updating add-on group:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update add-on group",
      error: error.message,
    });
  }
};

// Delete add-on group (soft delete)
exports.deleteAddOnGroup = async (req, res) => {
  try {
    const group = await AddOnGroup.findOne({
      _id: req.params.id,
      storeId: req.storeId,
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Add-on group not found",
      });
    }

    // Check if group is used by any menu items (scoped to store)
    const menuItemsUsingGroup = await MenuItem.countDocuments({
      addOnGroups: req.params.id,
      storeId: req.storeId,
    });

    if (menuItemsUsingGroup > 0) {
      // Soft delete by setting isActive to false
      group.isActive = false;
      await group.save();

      // Log the action
      await logAction(
        req.user.id,
        req.storeId,
        req.organizationId,
        "AddOnGroup",
        req.params.id,
        "update",
        { ...group.toObject(), isActive: true },
        group,
        `Deactivated add-on group: ${group.name} (used by ${menuItemsUsingGroup} menu items)`
      );

      return res.status(200).json({
        success: true,
        message: `Add-on group deactivated (used by ${menuItemsUsingGroup} menu items)`,
        data: group,
      });
    }

    // Hard delete if not used
    await AddOnGroup.findOneAndDelete({
      _id: req.params.id,
      storeId: req.storeId,
    });

    // Log the action
    await logAction(
      req.user.id,
      req.storeId,
      req.organizationId,
      "AddOnGroup",
      req.params.id,
      "delete",
      group,
      null,
      `Deleted add-on group: ${group.name}`
    );

    res.status(200).json({
      success: true,
      message: "Add-on group deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting add-on group:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete add-on group",
      error: error.message,
    });
  }
};

// Get add-on groups for a specific menu item
exports.getAddOnGroupsForMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findOne({
      _id: req.params.menuItemId,
      storeId: req.storeId,
    }).populate({
      path: "addOnGroups",
      match: { isActive: true }, // Removed storeId here as MenuItem is already storeId scoped
      populate: {
        path: "items.inventoryItem",
        select: "name unit currentStock",
      },
    });

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    // Filter out unavailable items within groups and handle potential nulls
    const groups = menuItem.addOnGroups
      .filter((g) => g && typeof g === "object")
      .map((group) => ({
        ...(group.toObject ? group.toObject() : group),
        items: (group.items || []).filter((item) => item.isAvailable),
      }));

    res.status(200).json({
      success: true,
      data: groups,
    });
  } catch (error) {
    console.error("Error fetching add-on groups for menu item:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch add-on groups",
      error: error.message,
    });
  }
};

module.exports = exports;


