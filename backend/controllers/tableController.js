// backend/controllers/tableController.js
const Table = require("../models/Table");
const Floor = require("../models/Floor");
const Order = require("../models/Order");
const Reservation = require("../models/Reservation");
const logAction = require("../utils/logAction");

// Get all tables
exports.getAllTables = async (req, res) => {
try {
const { floor, status, assignedStaff, active } = req.query;

    const filter = {};
    if (floor) filter.floor = floor;
    if (status) filter.status = status;
    if (assignedStaff) filter.assignedStaff = assignedStaff;
    if (active !== undefined) filter.isActive = active === "true";

    const tables = await Table.find(filter)
      .populate("floor", "name")
      .populate("assignedStaff", "fullname")
      .populate("currentOrder", "orderNumber orderStatus totalAmount")
      .populate("mergedWith", "tableNumber status")
      .sort({ floor: 1, tableNumber: 1 });

    res.status(200).json({
      success: true,
      count: tables.length,
      data: tables,
    });

} catch (error) {
console.error("Error fetching tables:", error);
res.status(500).json({
success: false,
message: "Failed to fetch tables",
error: error.message,
});
}
};

// Get single table
exports.getTableById = async (req, res) => {
try {
const table = await Table.findById(req.params.id)
.populate("floor", "name")
.populate("assignedStaff", "fullname")
.populate("currentOrder")
.populate("mergedWith", "tableNumber status")
.populate("lastAction.performedBy", "fullname");

    if (!table) {
      return res.status(404).json({
        success: false,
        message: "Table not found",
      });
    }

    res.status(200).json({
      success: true,
      data: table,
    });

} catch (error) {
console.error("Error fetching table:", error);
res.status(500).json({
success: false,
message: "Failed to fetch table",
error: error.message,
});
}
};

// Create table
exports.createTable = async (req, res) => {
try {
const {
tableNumber,
floor,
capacity,
shape,
position,
notes,
} = req.body;

    if (!tableNumber || !floor || !capacity) {
      return res.status(400).json({
        success: false,
        message: "Table number, floor, and capacity are required",
      });
    }

    // Verify floor exists
    const floorExists = await Floor.findById(floor);
    if (!floorExists) {
      return res.status(404).json({
        success: false,
        message: "Floor not found",
      });
    }

    // Check for duplicate table number on same floor
    const existingTable = await Table.findOne({ tableNumber, floor });
    if (existingTable) {
      return res.status(400).json({
        success: false,
        message: "A table with this number already exists on this floor",
      });
    }

    const table = await Table.create({
      tableNumber,
      floor,
      capacity,
      shape: shape || "square",
      position: position || { x: 0, y: 0 },
      notes: notes || "",
      lastAction: {
        action: "create",
        performedBy: req.user.id,
        createdAt: new Date(),
      },
    });

    await logAction(
      req.user.id,
      "Table",
      table._id,
      "create",
      null,
      table,
      `Created table: ${tableNumber} on ${floorExists.name}`
    );

    const populatedTable = await Table.findById(table._id)
      .populate("floor", "name")
      .populate("assignedStaff", "fullname");

    res.status(201).json({
      success: true,
      message: "Table created successfully",
      data: populatedTable,
    });

} catch (error) {
console.error("Error creating table:", error);
res.status(500).json({
success: false,
message: "Failed to create table",
error: error.message,
});
}
};

// Update table
exports.updateTable = async (req, res) => {
try {
const { id } = req.params;
const updateData = req.body;

    const oldTable = await Table.findById(id);
    if (!oldTable) {
      return res.status(404).json({
        success: false,
        message: "Table not found",
      });
    }

    // Check for duplicate table number if being changed
    if (updateData.tableNumber || updateData.floor) {
      const tableNumber = updateData.tableNumber || oldTable.tableNumber;
      const floor = updateData.floor || oldTable.floor;

      const existingTable = await Table.findOne({
        tableNumber,
        floor,
        _id: { $ne: id },
      });

      if (existingTable) {
        return res.status(400).json({
          success: false,
          message: "A table with this number already exists on this floor",
        });
      }
    }

    const table = await Table.findByIdAndUpdate(
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
    )
      .populate("floor", "name")
      .populate("assignedStaff", "fullname")
      .populate("currentOrder");

    await logAction(
      req.user.id,
      "Table",
      table._id,
      "update",
      oldTable,
      table,
      `Updated table: ${table.tableNumber}`
    );

    res.status(200).json({
      success: true,
      message: "Table updated successfully",
      data: table,
    });

} catch (error) {
console.error("Error updating table:", error);
res.status(500).json({
success: false,
message: "Failed to update table",
error: error.message,
});
}
};

// Delete table (soft delete)
exports.deleteTable = async (req, res) => {
try {
const { id } = req.params;

    const table = await Table.findById(id);
    if (!table) {
      return res.status(404).json({
        success: false,
        message: "Table not found",
      });
    }

    // Can't delete occupied or ordered tables
    if (["occupied", "ordered"].includes(table.status)) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete a table with an active order",
      });
    }

    // Can't delete reserved tables
    const activeReservations = await Reservation.countDocuments({
      table: id,
      status: { $in: ["pending", "confirmed"] },
    });

    if (activeReservations > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete a table with active reservations",
      });
    }

    table.isActive = false;
    table.lastAction = {
      action: "delete",
      performedBy: req.user.id,
      createdAt: new Date(),
    };
    await table.save();

    await logAction(
      req.user.id,
      "Table",
      id,
      "delete",
      table,
      null,
      `Deleted table: ${table.tableNumber}`
    );

    res.status(200).json({
      success: true,
      message: "Table deleted successfully",
    });

} catch (error) {
console.error("Error deleting table:", error);
res.status(500).json({
success: false,
message: "Failed to delete table",
error: error.message,
});
}
};

// Update table status
exports.updateTableStatus = async (req, res) => {
try {
const { id } = req.params;
const { status, reason } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const table = await Table.findById(id);
    if (!table) {
      return res.status(404).json({
        success: false,
        message: "Table not found",
      });
    }

    const oldStatus = table.status;

    // Validate status transitions
    if (status === "occupied" || status === "ordered") {
      if (!table.currentOrder) {
        return res.status(400).json({
          success: false,
          message: `Cannot set status to ${status} without an order`,
        });
      }
    }

    // If setting to available, clear order and staff
    if (status === "available") {
      table.currentOrder = null;
      table.assignedStaff = null;
    }

    table.status = status;
    table.lastAction = {
      action: "status_change",
      performedBy: req.user.id,
      createdAt: new Date(),
      reason: reason || `Status changed from ${oldStatus} to ${status}`,
    };

    await table.save();

    const populatedTable = await Table.findById(id)
      .populate("floor", "name")
      .populate("assignedStaff", "fullname")
      .populate("currentOrder");

    res.status(200).json({
      success: true,
      message: "Table status updated successfully",
      data: populatedTable,
    });

} catch (error) {
console.error("Error updating table status:", error);
res.status(500).json({
success: false,
message: "Failed to update table status",
error: error.message,
});
}
};

// Assign staff to table
exports.assignStaff = async (req, res) => {
try {
const { id } = req.params;
const { staffId, reason } = req.body;

    const table = await Table.findById(id);
    if (!table) {
      return res.status(404).json({
        success: false,
        message: "Table not found",
      });
    }

    // Can't assign staff to unavailable tables
    if (table.status === "unavailable") {
      return res.status(400).json({
        success: false,
        message: "Cannot assign staff to unavailable tables",
      });
    }

    table.assignedStaff = staffId || null;
    table.lastAction = {
      action: "assign",
      performedBy: req.user.id,
      createdAt: new Date(),
      reason: reason || "Staff assigned to table",
    };

    await table.save();

    const populatedTable = await Table.findById(id)
      .populate("floor", "name")
      .populate("assignedStaff", "fullname")
      .populate("currentOrder");

    res.status(200).json({
      success: true,
      message: staffId
        ? "Staff assigned successfully"
        : "Staff unassigned successfully",
      data: populatedTable,
    });

} catch (error) {
console.error("Error assigning staff:", error);
res.status(500).json({
success: false,
message: "Failed to assign staff",
error: error.message,
});
}
};

// Link order to table
exports.linkOrder = async (req, res) => {
try {
const { id } = req.params;
const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    const table = await Table.findById(id);
    if (!table) {
      return res.status(404).json({
        success: false,
        message: "Table not found",
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if order is already linked to another table
    const existingTable = await Table.findOne({
      currentOrder: orderId,
      _id: { $ne: id },
    });

    if (existingTable) {
      return res.status(400).json({
        success: false,
        message: `Order is already linked to table ${existingTable.tableNumber}`,
      });
    }

    // Update table
    table.currentOrder = orderId;
    table.status = "ordered";
    await table.save();

    // Update order with table info
    order.table = table.tableNumber;
    await order.save();

    const populatedTable = await Table.findById(id)
      .populate("floor", "name")
      .populate("assignedStaff", "fullname")
      .populate("currentOrder");

    res.status(200).json({
      success: true,
      message: "Order linked to table successfully",
      data: populatedTable,
    });

} catch (error) {
console.error("Error linking order:", error);
res.status(500).json({
success: false,
message: "Failed to link order",
error: error.message,
});
}
};

// Unlink order from table
exports.unlinkOrder = async (req, res) => {
try {
const { id } = req.params;
const { reason } = req.body;

    const table = await Table.findById(id);
    if (!table) {
      return res.status(404).json({
        success: false,
        message: "Table not found",
      });
    }

    table.currentOrder = null;
    table.status = "available";
    table.assignedStaff = null;
    table.lastAction = {
      action: "update",
      performedBy: req.user.id,
      createdAt: new Date(),
      reason: reason || "Order unlinked from table",
    };

    await table.save();

    const populatedTable = await Table.findById(id)
      .populate("floor", "name")
      .populate("assignedStaff", "fullname");

    res.status(200).json({
      success: true,
      message: "Order unlinked successfully",
      data: populatedTable,
    });

} catch (error) {
console.error("Error unlinking order:", error);
res.status(500).json({
success: false,
message: "Failed to unlink order",
error: error.message,
});
}
};