// backend/controllers/floorController.js
const Floor = require("../models/Floor");
const Table = require("../models/Table");
const logAction = require("../utils/logAction");

// Get all floors
exports.getAllFloors = async (req, res) => {
try {
const { active } = req.query;
const filter = {};
if (active !== undefined) filter.isActive = active === "true";

    const floors = await Floor.find(filter)
      .sort({ displayOrder: 1, name: 1 })
      .populate("lastAction.performedBy", "fullname");

    // Get table counts for each floor
    const floorsWithCounts = await Promise.all(
      floors.map(async (floor) => {
        const tableCount = await Table.countDocuments({
          floor: floor._id,
          isActive: true,
        });
        return {
          ...floor.toObject(),
          tableCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: floors.length,
      data: floorsWithCounts,
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

// Get single floor
exports.getFloorById = async (req, res) => {
try {
const floor = await Floor.findById(req.params.id).populate(
"lastAction.performedBy",
"fullname"
);

    if (!floor) {
      return res.status(404).json({
        success: false,
        message: "Floor not found",
      });
    }

    // Get tables for this floor
    const tables = await Table.find({ floor: floor._id, isActive: true })
      .populate("assignedStaff", "fullname")
      .populate("currentOrder", "orderNumber orderStatus totalAmount");

    res.status(200).json({
      success: true,
      data: {
        ...floor.toObject(),
        tables,
      },
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

// Create floor
exports.createFloor = async (req, res) => {
try {
const { name, description, displayOrder } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Floor name is required",
      });
    }

    // Check for duplicate name
    const existingFloor = await Floor.findOne({ name });
    if (existingFloor) {
      return res.status(400).json({
        success: false,
        message: "A floor with this name already exists",
      });
    }

    const floor = await Floor.create({
      name,
      description: description || "",
      displayOrder: displayOrder || 0,
      lastAction: {
        action: "create",
        performedBy: req.user.id,
        createdAt: new Date(),
      },
    });

    await logAction(
      req.user.id,
      "Floor",
      floor._id,
      "create",
      null,
      floor,
      `Created floor: ${name}`
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

// Update floor
exports.updateFloor = async (req, res) => {
try {
const { id } = req.params;
const updateData = req.body;

    const oldFloor = await Floor.findById(id);
    if (!oldFloor) {
      return res.status(404).json({
        success: false,
        message: "Floor not found",
      });
    }

    // Check for duplicate name if name is being changed
    if (updateData.name && updateData.name !== oldFloor.name) {
      const existingFloor = await Floor.findOne({
        name: updateData.name,
        _id: { $ne: id },
      });
      if (existingFloor) {
        return res.status(400).json({
          success: false,
          message: "A floor with this name already exists",
        });
      }
    }

    const floor = await Floor.findByIdAndUpdate(
      id,
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
      "Floor",
      floor._id,
      "update",
      oldFloor,
      floor,
      `Updated floor: ${floor.name}`
    );

    res.status(200).json({
      success: true,
      message: "Floor updated successfully",
      data: floor,
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

// Delete floor (soft delete)
exports.deleteFloor = async (req, res) => {
try {
const { id } = req.params;

    const floor = await Floor.findById(id);
    if (!floor) {
      return res.status(404).json({
        success: false,
        message: "Floor not found",
      });
    }

    // Check if floor has active tables
    const tableCount = await Table.countDocuments({
      floor: id,
      isActive: true,
    });

    if (tableCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete floor with ${tableCount} active table(s). Please delete or move the tables first.`,
      });
    }

    floor.isActive = false;
    floor.lastAction = {
      action: "delete",
      performedBy: req.user.id,
      createdAt: new Date(),
    };
    await floor.save();

    await logAction(
      req.user.id,
      "Floor",
      id,
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

// Reorder floors
exports.reorderFloors = async (req, res) => {
try {
const { floorIds } = req.body;

    if (!Array.isArray(floorIds) || floorIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid floor order data",
      });
    }

    await Promise.all(
      floorIds.map((floorId, index) =>
        Floor.findByIdAndUpdate(floorId, { displayOrder: index })
      )
    );

    res.status(200).json({
      success: true,
      message: "Floors reordered successfully",
    });

} catch (error) {
console.error("Error reordering floors:", error);
res.status(500).json({
success: false,
message: "Failed to reorder floors",
error: error.message,
});
}
};