const Table = require("../models/Table");
const Floor = require("../models/Floor");
const Order = require("../models/Order");
const logAction = require("../utils/logAction");

exports.getAllTables = async (req, res) => {
  try {
    const { floorId, status, isActive } = req.query;
    const filter = {};

    if (floorId) filter.floorId = floorId;
    if (status) filter.status = status;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const tables = await Table.find(filter)
      .populate("floorId", "name")
      .populate("assignedStaff", "fullname")
      .populate("currentOrder", "orderNumber orderStatus totalAmount")
      .populate("mergedWith", "tableNumber")
      .sort({ "floorId.order": 1, tableNumber: 1 });

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

exports.getTableById = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id)
      .populate("floorId", "name")
      .populate("assignedStaff", "fullname email")
      .populate("currentOrder")
      .populate("mergedWith", "tableNumber status");

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

exports.createTable = async (req, res) => {
  try {
    const {
      floorId,
      tableNumber,
      capacity,
      position,
      shape,
      notes,
      assignedStaff,
    } = req.body;

    if (!floorId || !tableNumber) {
      return res.status(400).json({
        success: false,
        message: "Floor ID and table number are required",
      });
    }

    const floor = await Floor.findById(floorId);
    if (!floor) {
      return res.status(404).json({
        success: false,
        message: "Floor not found",
      });
    }

    const existingTable = await Table.findOne({
      floorId,
      tableNumber: tableNumber.trim(),
      isActive: true,
    });

    if (existingTable) {
      return res.status(400).json({
        success: false,
        message: `Table ${tableNumber} already exists on ${floor.name}`,
      });
    }

    const table = await Table.create({
      floorId,
      tableNumber: tableNumber.trim(),
      capacity: capacity || 4,
      position: position || { x: 0, y: 0 },
      shape: shape || "square",
      notes: notes || "",
      assignedStaff: assignedStaff || null,
      status: "available",
    });

    await logAction(
      req.user.id,
      "Table",
      table._id,
      "create",
      null,
      table,
      `Created table: ${tableNumber} on ${floor.name}`
    );

    const populatedTable = await Table.findById(table._id)
      .populate("floorId", "name")
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

exports.updateTable = async (req, res) => {
  try {
    const oldTable = await Table.findById(req.params.id);

    if (!oldTable) {
      return res.status(404).json({
        success: false,
        message: "Table not found",
      });
    }

    const {
      tableNumber,
      capacity,
      position,
      shape,
      notes,
      assignedStaff,
      status,
      isActive,
    } = req.body;

    if (tableNumber && tableNumber !== oldTable.tableNumber) {
      const existingTable = await Table.findOne({
        floorId: oldTable.floorId,
        tableNumber: tableNumber.trim(),
        _id: { $ne: req.params.id },
        isActive: true,
      });

      if (existingTable) {
        return res.status(400).json({
          success: false,
          message: `Table ${tableNumber} already exists on this floor`,
        });
      }
    }

    const updateData = {};
    if (tableNumber !== undefined) updateData.tableNumber = tableNumber.trim();
    if (capacity !== undefined) updateData.capacity = capacity;
    if (position !== undefined) updateData.position = position;
    if (shape !== undefined) updateData.shape = shape;
    if (notes !== undefined) updateData.notes = notes;
    if (assignedStaff !== undefined) updateData.assignedStaff = assignedStaff;
    if (status !== undefined) updateData.status = status;
    if (isActive !== undefined) updateData.isActive = isActive;

    if (status === "occupied" && oldTable.status !== "occupied") {
      updateData.lastOccupiedAt = new Date();
    }

    const updatedTable = await Table.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("floorId", "name")
      .populate("assignedStaff", "fullname");

    await logAction(
      req.user.id,
      "Table",
      req.params.id,
      "update",
      oldTable,
      updatedTable,
      req.body.reason || `Updated table: ${updatedTable.tableNumber}`
    );

    res.status(200).json({
      success: true,
      message: "Table updated successfully",
      data: updatedTable,
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

exports.updateTableStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const table = await Table.findById(req.params.id);

    if (!table) {
      return res.status(404).json({
        success: false,
        message: "Table not found",
      });
    }

    const oldStatus = table.status;
    table.status = status;

    if (status === "occupied" && oldStatus !== "occupied") {
      table.lastOccupiedAt = new Date();
    }

    if (status === "available") {
      table.currentOrder = null;
      table.mergedWith = [];
    }

    await table.save();

    await logAction(
      req.user.id,
      "Table",
      req.params.id,
      "state_change",
      { status: oldStatus },
      { status },
      reason || `Changed status from ${oldStatus} to ${status}`
    );

    const populatedTable = await Table.findById(table._id)
      .populate("floorId", "name")
      .populate("assignedStaff", "fullname")
      .populate("currentOrder", "orderNumber");

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

exports.linkTableToOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    const table = await Table.findById(req.params.id);
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

    if (table.currentOrder && table.currentOrder.toString() !== orderId) {
      return res.status(400).json({
        success: false,
        message: "Table already has an active order",
      });
    }

    table.currentOrder = orderId;
    table.status = "ordered";
    table.lastOccupiedAt = new Date();
    await table.save();

    order.table = table.tableNumber;
    await order.save();

    await logAction(
      req.user.id,
      "Table",
      req.params.id,
      "update",
      { currentOrder: null },
      { currentOrder: orderId },
      `Linked table ${table.tableNumber} to order #${order.orderNumber}`
    );

    const populatedTable = await Table.findById(table._id)
      .populate("floorId", "name")
      .populate("currentOrder", "orderNumber orderStatus totalAmount");

    res.status(200).json({
      success: true,
      message: "Table linked to order successfully",
      data: populatedTable,
    });
  } catch (error) {
    console.error("Error linking table to order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to link table to order",
      error: error.message,
    });
  }
};

exports.unlinkTableFromOrder = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);

    if (!table) {
      return res.status(404).json({
        success: false,
        message: "Table not found",
      });
    }

    const oldOrderId = table.currentOrder;
    table.currentOrder = null;
    table.status = "cleaning";
    await table.save();

    await logAction(
      req.user.id,
      "Table",
      req.params.id,
      "update",
      { currentOrder: oldOrderId },
      { currentOrder: null },
      `Unlinked table ${table.tableNumber} from order`
    );

    const populatedTable = await Table.findById(table._id)
      .populate("floorId", "name")
      .populate("assignedStaff", "fullname");

    res.status(200).json({
      success: true,
      message: "Table unlinked from order, status set to cleaning",
      data: populatedTable,
    });
  } catch (error) {
    console.error("Error unlinking table from order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to unlink table from order",
      error: error.message,
    });
  }
};

exports.mergeTables = async (req, res) => {
  try {
    const { tableIds, reason } = req.body;

    if (!tableIds || tableIds.length < 2) {
      return res.status(400).json({
        success: false,
        message: "At least 2 tables are required to merge",
      });
    }

    const tables = await Table.find({ _id: { $in: tableIds }, isActive: true });

    if (tables.length !== tableIds.length) {
      return res.status(404).json({
        success: false,
        message: "One or more tables not found",
      });
    }

    const floorIds = [...new Set(tables.map((t) => t.floorId.toString()))];
    if (floorIds.length > 1) {
      return res.status(400).json({
        success: false,
        message: "Cannot merge tables from different floors",
      });
    }

    const busyTables = tables.filter(
      (t) => t.currentOrder || t.status === "reserved"
    );
    if (busyTables.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot merge tables with active orders or reservations",
      });
    }

    const mergedTableIds = tableIds.filter((id) => id !== tableIds[0]);

    for (const table of tables) {
      table.mergedWith = mergedTableIds;
      table.status = "occupied";
      await table.save();

      await logAction(
        req.user.id,
        "Table",
        table._id,
        "merge",
        { mergedWith: [] },
        { mergedWith: mergedTableIds },
        reason ||
          `Merged tables: ${tables.map((t) => t.tableNumber).join(", ")}`
      );
    }

    const updatedTables = await Table.find({ _id: { $in: tableIds } })
      .populate("floorId", "name")
      .populate("mergedWith", "tableNumber");

    res.status(200).json({
      success: true,
      message: "Tables merged successfully",
      data: updatedTables,
    });
  } catch (error) {
    console.error("Error merging tables:", error);
    res.status(500).json({
      success: false,
      message: "Failed to merge tables",
      error: error.message,
    });
  }
};

exports.splitTables = async (req, res) => {
  try {
    const { reason } = req.body;
    const table = await Table.findById(req.params.id);

    if (!table) {
      return res.status(404).json({
        success: false,
        message: "Table not found",
      });
    }

    if (!table.mergedWith || table.mergedWith.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Table is not merged with any other tables",
      });
    }

    if (table.currentOrder) {
      return res.status(400).json({
        success: false,
        message: "Cannot split tables with an active order",
      });
    }

    const allMergedIds = [table._id, ...table.mergedWith];
    const oldMergedWith = [...table.mergedWith];

    await Table.updateMany(
      { _id: { $in: allMergedIds } },
      { $set: { mergedWith: [], status: "available" } }
    );

    for (const tableId of allMergedIds) {
      await logAction(
        req.user.id,
        "Table",
        tableId,
        "split",
        { mergedWith: oldMergedWith },
        { mergedWith: [] },
        reason || "Tables split"
      );
    }

    const updatedTables = await Table.find({
      _id: { $in: allMergedIds },
    }).populate("floorId", "name");

    res.status(200).json({
      success: true,
      message: "Tables split successfully",
      data: updatedTables,
    });
  } catch (error) {
    console.error("Error splitting tables:", error);
    res.status(500).json({
      success: false,
      message: "Failed to split tables",
      error: error.message,
    });
  }
};

exports.updateTablePosition = async (req, res) => {
  try {
    const { position } = req.body;

    if (!position || position.x === undefined || position.y === undefined) {
      return res.status(400).json({
        success: false,
        message: "Position with x and y coordinates is required",
      });
    }

    const table = await Table.findById(req.params.id);

    if (!table) {
      return res.status(404).json({
        success: false,
        message: "Table not found",
      });
    }

    table.position = position;
    await table.save();

    res.status(200).json({
      success: true,
      message: "Table position updated",
      data: table,
    });
  } catch (error) {
    console.error("Error updating table position:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update table position",
      error: error.message,
    });
  }
};

exports.deleteTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);

    if (!table) {
      return res.status(404).json({
        success: false,
        message: "Table not found",
      });
    }

    if (table.currentOrder) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete table with an active order",
      });
    }

    if (table.mergedWith && table.mergedWith.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete merged table. Split tables first.",
      });
    }

    table.isActive = false;
    await table.save();

    await logAction(
      req.user.id,
      "Table",
      req.params.id,
      "delete",
      table,
      { isActive: false },
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

module.exports = exports;
