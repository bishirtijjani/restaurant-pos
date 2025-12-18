// backend/controllers/floorController.js - ENHANCED
const Floor = require("../models/Floor");
const Table = require("../models/Table");
const logAction = require("../utils/logAction");
const { notifyFloorUpdate } = require("../utils/webSocket");

exports.getAllFloors = async (req, res) => {
  try {
    const { isActive } = req.query;
    const filter = { storeId: req.storeId };
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const floors = await Floor.find(filter).sort({ order: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: floors.length,
      data: floors,
    });
  } catch (error) {
    console.error("Error fetching floors:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch floors",
      error: error.message,
    });
  }
};

exports.getFloorById = async (req, res) => {
  try {
    const floor = await Floor.findOne({
      _id: req.params.id,
      storeId: req.storeId,
    });

    if (!floor) {
      return res.status(404).json({
        success: false,
        message: "Floor not found",
      });
    }

    const tables = await Table.find({
      floorId: floor._id,
      storeId: req.storeId,
      isActive: true,
    })
      .populate("assignedStaff", "fullname")
      .populate("currentOrder", "orderNumber orderStatus")
      .sort({ tableNumber: 1 });

    res.status(200).json({
      success: true,
      data: { ...floor.toObject(), tables },
    });
  } catch (error) {
    console.error("Error fetching floor:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch floor",
      error: error.message,
    });
  }
};

exports.createFloor = async (req, res) => {
  try {
    const { name, description, order } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Floor name is required",
      });
    }

    const existingFloor = await Floor.findOne({
      name: name.trim(),
      storeId: req.storeId,
      isActive: true,
    });

    if (existingFloor) {
      return res.status(400).json({
        success: false,
        message: "A floor with this name already exists",
      });
    }

    const floor = await Floor.create({
      name: name.trim(),
      description: description || "",
      order: order || 0,
      storeId: req.storeId,
    });

    await logAction(
      req.user.id,
      req.storeId,
      "Floor",
      floor._id,
      "create",
      null,
      floor,
      `Created floor: ${floor.name}`
    );

    res.status(201).json({
      success: true,
      message: "Floor created successfully",
      data: floor,
    });
  } catch (error) {
    console.error("Error creating floor:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create floor",
      error: error.message,
    });
  }
};

exports.updateFloor = async (req, res) => {
  try {
    const oldFloor = await Floor.findOne({
      _id: req.params.id,
      storeId: req.storeId,
    });

    if (!oldFloor) {
      return res.status(404).json({
        success: false,
        message: "Floor not found",
      });
    }

    const { name, description, order, isActive } = req.body;

    if (name && name !== oldFloor.name) {
      const existingFloor = await Floor.findOne({
        name: name.trim(),
        storeId: req.storeId,
        _id: { $ne: req.params.id },
        isActive: true,
      });

      if (existingFloor) {
        return res.status(400).json({
          success: false,
          message: "A floor with this name already exists",
        });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description;
    if (order !== undefined) updateData.order = order;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedFloor = await Floor.findOneAndUpdate(
      { _id: req.params.id, storeId: req.storeId },
      updateData,
      { new: true, runValidators: true }
    );

    await logAction(
      req.user.id,
      req.storeId,
      "Floor",
      req.params.id,
      "update",
      oldFloor,
      updatedFloor,
      req.body.reason || `Updated floor: ${updatedFloor.name}`
    );

    res.status(200).json({
      success: true,
      message: "Floor updated successfully",
      data: updatedFloor,
    });
  } catch (error) {
    console.error("Error updating floor:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update floor",
      error: error.message,
    });
  }
};

exports.updateFloorLayout = async (req, res) => {
  try {
    const { layout } = req.body;

    const floor = await Floor.findOneAndUpdate(
      { _id: req.params.id, storeId: req.storeId },
      { layout },
      { new: true, runValidators: true }
    );

    if (!floor) {
      return res.status(404).json({
        success: false,
        message: "Floor not found",
      });
    }

    // Notify via WebSocket
    notifyFloorUpdate("floor:layout_updated", floor, req.storeId);

    res.status(200).json({
      success: true,
      message: "Floor layout updated",
      data: floor,
    });
  } catch (error) {
    console.error("Error updating floor layout:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update floor layout",
      error: error.message,
    });
  }
};

// NEW: Bulk update table positions (for drag-and-drop)
exports.updateTablePositions = async (req, res) => {
  try {
    const { tables } = req.body; // Array of { id, position }

    if (!Array.isArray(tables)) {
      return res.status(400).json({
        success: false,
        message: "Tables must be an array",
      });
    }

    const updatePromises = tables.map((table) =>
      Table.findOneAndUpdate(
        { _id: table.id, storeId: req.storeId },
        { position: table.position },
        { new: true }
      )
    );

    await Promise.all(updatePromises);

    // Notify via WebSocket
    notifyFloorUpdate("tables:positions_updated", { tables }, req.storeId);

    res.status(200).json({
      success: true,
      message: "Table positions updated",
    });
  } catch (error) {
    console.error("Error updating table positions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update table positions",
      error: error.message,
    });
  }
};

exports.deleteFloor = async (req, res) => {
  try {
    const floor = await Floor.findOne({
      _id: req.params.id,
      storeId: req.storeId,
    });

    if (!floor) {
      return res.status(404).json({
        success: false,
        message: "Floor not found",
      });
    }

    const tablesCount = await Table.countDocuments({
      floorId: req.params.id,
      storeId: req.storeId,
      isActive: true,
    });

    if (tablesCount > 0) {
      floor.isActive = false;
      await floor.save();

      await logAction(
        req.user.id,
        req.storeId,
        "Floor",
        req.params.id,
        "update",
        { ...floor.toObject(), isActive: true },
        floor,
        `Deactivated floor: ${floor.name} (${tablesCount} tables)`
      );

      return res.status(200).json({
        success: true,
        message: `Floor deactivated (contains ${tablesCount} tables)`,
        data: floor,
      });
    }

    await Floor.findOneAndDelete({ _id: req.params.id, storeId: req.storeId });

    await logAction(
      req.user.id,
      req.storeId,
      "Floor",
      req.params.id,
      "delete",
      floor,
      null,
      `Deleted floor: ${floor.name}`
    );

    res.status(200).json({
      success: true,
      message: "Floor deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting floor:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete floor",
      error: error.message,
    });
  }
};

module.exports = exports;
