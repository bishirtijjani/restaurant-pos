const Floor = require("../models/Floor");
const Table = require("../models/Table");
const logAction = require("../utils/logAction");

exports.getAllFloors = async (req, res) => {
  try {
    const { isActive } = req.query;
    const filter = {};
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
    const floor = await Floor.findById(req.params.id);

    if (!floor) {
      return res.status(404).json({
        success: false,
        message: "Floor not found",
      });
    }

    const tables = await Table.find({ floorId: floor._id, isActive: true })
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
    });

    await logAction(
      req.user.id,
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
    const oldFloor = await Floor.findById(req.params.id);

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

    const updatedFloor = await Floor.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    await logAction(
      req.user.id,
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

exports.deleteFloor = async (req, res) => {
  try {
    const floor = await Floor.findById(req.params.id);

    if (!floor) {
      return res.status(404).json({
        success: false,
        message: "Floor not found",
      });
    }

    const tablesCount = await Table.countDocuments({
      floorId: req.params.id,
      isActive: true,
    });

    if (tablesCount > 0) {
      floor.isActive = false;
      await floor.save();

      await logAction(
        req.user.id,
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

    await Floor.findByIdAndDelete(req.params.id);

    await logAction(
      req.user.id,
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
