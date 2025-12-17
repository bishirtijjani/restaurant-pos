// backend/controllers/tableController.js - ENHANCED
const Table = require("../models/Table");
const Floor = require("../models/Floor");
const Order = require("../models/Order");
const Reservation = require("../models/Reservation");
const logAction = require("../utils/logAction");
const { notifyTableUpdate } = require("../utils/webSocket");
const QRCode = require("qrcode");

// NEW: Generate QR code for table
exports.generateTableQR = async (req, res) => {
  try {
    const table = await Table.findOne({
      _id: req.params.id,
      storeId: req.storeId,
    });

    if (!table) {
      return res.status(404).json({
        success: false,
        message: "Table not found",
      });
    }

    const qrData = {
      tableId: table._id,
      tableNumber: table.tableNumber,
      floorId: table.floorId,
      timestamp: Date.now(),
    };

    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData));

    table.qrCode = qrCodeDataUrl;
    await table.save();

    res.status(200).json({
      success: true,
      data: { qrCode: qrCodeDataUrl },
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate QR code",
      error: error.message,
    });
  }
};

// ENHANCED: Update table with real-time broadcast
exports.updateTable = async (req, res) => {
  try {
    const oldTable = await Table.findOne({
      _id: req.params.id,
      storeId: req.storeId,
    });

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
      styling,
    } = req.body;

    // Check for duplicate table number (within same store and floor)
    if (tableNumber && tableNumber !== oldTable.tableNumber) {
      const existingTable = await Table.findOne({
        floorId: oldTable.floorId,
        tableNumber: tableNumber.trim(),
        storeId: req.storeId,
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
    if (status !== undefined) {
      updateData.status = status;
      // Update timing
      if (status === "occupied" && oldTable.status !== "occupied") {
        updateData["timing.seatedAt"] = new Date();
      } else if (status === "available") {
        updateData["timing.seatedAt"] = null;
        updateData["timing.orderedAt"] = null;
      }
    }
    if (isActive !== undefined) updateData.isActive = isActive;
    if (styling !== undefined) updateData.styling = styling;

    if (status === "occupied" && oldTable.status !== "occupied") {
      updateData.lastOccupiedAt = new Date();
    }

    const updatedTable = await Table.findOneAndUpdate(
      { _id: req.params.id, storeId: req.storeId },
      updateData,
      { new: true, runValidators: true }
    )
      .populate("floorId", "name")
      .populate("assignedStaff", "fullname")
      .populate("currentOrder", "orderNumber orderStatus totalAmount")
      .populate("currentReservation");

    await logAction(
      req.user.id,
      "Table",
      req.params.id,
      "update",
      oldTable,
      updatedTable,
      req.body.reason || `Updated table: ${updatedTable.tableNumber}`
    );

    // Update floor capacity
    const floor = await Floor.findById(oldTable.floorId);
    if (floor) {
      await floor.updateCapacity();
    }

    // Broadcast update via WebSocket
    notifyTableUpdate("table:updated", updatedTable, req.storeId);

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

// NEW: Get table timeline (occupancy history)
exports.getTableTimeline = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const table = await Table.findOne({
      _id: req.params.id,
      storeId: req.storeId,
    });
    if (!table) {
      return res.status(404).json({
        success: false,
        message: "Table not found",
      });
    }

    // Get orders for this table (scoped to store)
    const orders = await Order.find({
      table: table.tableNumber,
      storeId: req.storeId,
      createdAt: {
        $gte: startDate
          ? new Date(startDate)
          : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        $lte: endDate ? new Date(endDate) : new Date(),
      },
    }).sort({ createdAt: -1 });

    // Get reservations (scoped to store)
    const reservations = await Reservation.find({
      tableId: table._id,
      storeId: req.storeId,
      reservationDate: {
        $gte: startDate
          ? new Date(startDate)
          : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        $lte: endDate ? new Date(endDate) : new Date(),
      },
    }).sort({ reservationDate: -1 });

    res.status(200).json({
      success: true,
      data: {
        table,
        orders,
        reservations,
        stats: {
          totalOrders: orders.length,
          totalRevenue: orders.reduce((sum, o) => sum + o.totalAmount, 0),
          averageOrderValue:
            orders.length > 0
              ? orders.reduce((sum, o) => sum + o.totalAmount, 0) /
                orders.length
              : 0,
          totalReservations: reservations.length,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching table timeline:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch table timeline",
      error: error.message,
    });
  }
};

exports.getAllTables = async (req, res) => {
  try {
    const { floorId, status, isActive } = req.query;
    const filter = { storeId: req.storeId };

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
    const table = await Table.findOne({
      _id: req.params.id,
      storeId: req.storeId,
    })
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
      storeId: req.storeId,
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
      storeId: req.storeId,
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

exports.updateTableStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const table = await Table.findOne({
      _id: req.params.id,
      storeId: req.storeId,
    });

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

    // Broadcast update via WebSocket
    notifyTableUpdate("table:updated", populatedTable, req.storeId);

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

    const table = await Table.findOne({
      _id: req.params.id,
      storeId: req.storeId,
    });
    if (!table) {
      return res.status(404).json({
        success: false,
        message: "Table not found",
      });
    }

    const order = await Order.findOne({ _id: orderId, storeId: req.storeId });
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

    // Broadcast update
    notifyTableUpdate("table:updated", populatedTable, req.storeId);

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

    // Broadcast update
    notifyTableUpdate("table:updated", populatedTable, req.storeId);

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

    const tables = await Table.find({
      _id: { $in: tableIds },
      storeId: req.storeId,
      isActive: true,
    });

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
