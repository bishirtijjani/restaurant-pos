I need you to create each and every file in this blackboard.md file and fill it with the contents outlined below for each file. Do not make mistakes. Do not correct or add anything. Only do exactly what is in the blackboard.md file as per my instructions.

1. Backend Models
   backend/models/Floor.js
   javascript// backend/models/Floor.js
   const mongoose = require("mongoose");

const floorSchema = new mongoose.Schema(
{
name: {
type: String,
required: true,
trim: true,
},
description: {
type: String,
default: "",
},
isActive: {
type: Boolean,
default: true,
},
displayOrder: {
type: Number,
default: 0,
},
lastAction: {
action: {
type: String,
enum: ["create", "update", "delete"],
default: null,
},
performedBy: {
type: mongoose.Schema.Types.ObjectId,
ref: "User",
default: null,
},
createdAt: { type: Date, default: null },
reason: { type: String, default: null },
},
},
{ timestamps: true }
);

floorSchema.index({ name: 1 });
floorSchema.index({ isActive: 1 });
floorSchema.index({ displayOrder: 1 });

module.exports = mongoose.model("Floor", floorSchema);
backend/models/Table.js
javascript// backend/models/Table.js
const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema(
{
tableNumber: {
type: String,
required: true,
trim: true,
},
floor: {
type: mongoose.Schema.Types.ObjectId,
ref: "Floor",
required: true,
},
capacity: {
type: Number,
required: true,
min: 1,
default: 4,
},
shape: {
type: String,
enum: ["square", "rectangle", "circle", "oval"],
default: "square",
},
status: {
type: String,
enum: [
"available",
"occupied",
"reserved",
"cleaning",
"unavailable",
"ordered",
],
default: "available",
},
currentOrder: {
type: mongoose.Schema.Types.ObjectId,
ref: "Order",
default: null,
},
assignedStaff: {
type: mongoose.Schema.Types.ObjectId,
ref: "User",
default: null,
},
position: {
x: { type: Number, default: 0 },
y: { type: Number, default: 0 },
},
notes: {
type: String,
default: "",
},
isActive: {
type: Boolean,
default: true,
},
// Merged tables tracking
isMerged: {
type: Boolean,
default: false,
},
mergedWith: [
{
type: mongoose.Schema.Types.ObjectId,
ref: "Table",
},
],
mergeGroup: {
type: String,
default: null,
},
lastAction: {
action: {
type: String,
enum: [
"create",
"update",
"delete",
"status_change",
"merge",
"split",
"assign",
],
default: null,
},
performedBy: {
type: mongoose.Schema.Types.ObjectId,
ref: "User",
default: null,
},
createdAt: { type: Date, default: null },
reason: { type: String, default: null },
},
},
{ timestamps: true }
);

// Compound index for unique table numbers per floor
tableSchema.index({ tableNumber: 1, floor: 1 }, { unique: true });
tableSchema.index({ floor: 1, isActive: 1 });
tableSchema.index({ status: 1 });
tableSchema.index({ assignedStaff: 1 });

// Pre-save validation
tableSchema.pre("save", async function (next) {
// Validate merged tables
if (this.isMerged && (!this.mergedWith || this.mergedWith.length === 0)) {
throw new Error("Merged table must have mergedWith references");
}

// Validate status transitions
if (this.isModified("status")) {
const oldStatus = this.\_original?.status;
const newStatus = this.status;

    // Can't set to occupied without an order
    if (newStatus === "occupied" && !this.currentOrder) {
      throw new Error("Cannot set status to occupied without an order");
    }

    // Can't set to ordered without an order
    if (newStatus === "ordered" && !this.currentOrder) {
      throw new Error("Cannot set status to ordered without an order");
    }

}

next();
});

// Store original document before save for validation
tableSchema.pre("save", function (next) {
if (!this.isNew) {
this.\_original = this.constructor
.findById(this.\_id)
.lean()
.exec()
.then((doc) => {
this.\_original = doc;
next();
})
.catch(next);
} else {
next();
}
});

module.exports = mongoose.model("Table", tableSchema);
backend/models/Reservation.js
javascript// backend/models/Reservation.js
const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
{
reservationNumber: {
type: String,
required: true,
unique: true,
},
customer: {
name: { type: String, required: true },
phone: { type: String, required: true },
email: { type: String },
},
customerId: {
type: mongoose.Schema.Types.ObjectId,
ref: "Customer",
default: null,
},
table: {
type: mongoose.Schema.Types.ObjectId,
ref: "Table",
required: true,
},
floor: {
type: mongoose.Schema.Types.ObjectId,
ref: "Floor",
required: true,
},
date: {
type: Date,
required: true,
},
time: {
type: String,
required: true,
},
duration: {
type: Number,
default: 120, // minutes
},
partySize: {
type: Number,
required: true,
min: 1,
},
status: {
type: String,
enum: ["pending", "confirmed", "seated", "completed", "cancelled", "no-show"],
default: "pending",
},
specialRequests: {
type: String,
default: "",
},
notes: {
type: String,
default: "",
},
createdBy: {
type: mongoose.Schema.Types.ObjectId,
ref: "User",
required: true,
},
confirmedBy: {
type: mongoose.Schema.Types.ObjectId,
ref: "User",
default: null,
},
seatedAt: {
type: Date,
default: null,
},
completedAt: {
type: Date,
default: null,
},
order: {
type: mongoose.Schema.Types.ObjectId,
ref: "Order",
default: null,
},
lastAction: {
action: {
type: String,
enum: ["create", "update", "confirm", "seat", "complete", "cancel"],
default: null,
},
performedBy: {
type: mongoose.Schema.Types.ObjectId,
ref: "User",
default: null,
},
createdAt: { type: Date, default: null },
reason: { type: String, default: null },
},
},
{ timestamps: true }
);

// Generate reservation number
reservationSchema.pre("save", async function (next) {
if (this.isNew && !this.reservationNumber) {
const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
const count = await this.constructor.countDocuments({
createdAt: {
$gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    });
    this.reservationNumber = `RES${dateStr}${(count + 1)
.toString()
.padStart(3, "0")}`;
}
next();
});

reservationSchema.index({ reservationNumber: 1 });
reservationSchema.index({ table: 1, date: 1 });
reservationSchema.index({ status: 1 });
reservationSchema.index({ date: 1 });
reservationSchema.index({ "customer.phone": 1 });

module.exports = mongoose.model("Reservation", reservationSchema); 2. Backend Controllers
backend/controllers/floorController.js
javascript// backend/controllers/floorController.js
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
backend/controllers/tableController.js
javascript// backend/controllers/tableController.js
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
      success: trueRetryThis response paused because Claude reached its max length for a message. Hit continue to nudge Claude along.Continue1. Backend Models

backend/models/Floor.js
javascript// backend/models/Floor.js
const mongoose = require("mongoose");

const floorSchema = new mongoose.Schema(
{
name: {
type: String,
required: true,
trim: true,
},
description: {
type: String,
default: "",
},
isActive: {
type: Boolean,
default: true,
},
displayOrder: {
type: Number,
default: 0,
},
lastAction: {
action: {
type: String,
enum: ["create", "update", "delete"],
default: null,
},
performedBy: {
type: mongoose.Schema.Types.ObjectId,
ref: "User",
default: null,
},
createdAt: { type: Date, default: null },
reason: { type: String, default: null },
},
},
{ timestamps: true }
);

floorSchema.index({ name: 1 });
floorSchema.index({ isActive: 1 });
floorSchema.index({ displayOrder: 1 });

module.exports = mongoose.model("Floor", floorSchema);
backend/models/Table.js
javascript// backend/models/Table.js
const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema(
{
tableNumber: {
type: String,
required: true,
trim: true,
},
floor: {
type: mongoose.Schema.Types.ObjectId,
ref: "Floor",
required: true,
},
capacity: {
type: Number,
required: true,
min: 1,
default: 4,
},
shape: {
type: String,
enum: ["square", "rectangle", "circle", "oval"],
default: "square",
},
status: {
type: String,
enum: [
"available",
"occupied",
"reserved",
"cleaning",
"unavailable",
"ordered",
],
default: "available",
},
currentOrder: {
type: mongoose.Schema.Types.ObjectId,
ref: "Order",
default: null,
},
assignedStaff: {
type: mongoose.Schema.Types.ObjectId,
ref: "User",
default: null,
},
position: {
x: { type: Number, default: 0 },
y: { type: Number, default: 0 },
},
notes: {
type: String,
default: "",
},
isActive: {
type: Boolean,
default: true,
},
// Merged tables tracking
isMerged: {
type: Boolean,
default: false,
},
mergedWith: [
{
type: mongoose.Schema.Types.ObjectId,
ref: "Table",
},
],
mergeGroup: {
type: String,
default: null,
},
lastAction: {
action: {
type: String,
enum: [
"create",
"update",
"delete",
"status_change",
"merge",
"split",
"assign",
],
default: null,
},
performedBy: {
type: mongoose.Schema.Types.ObjectId,
ref: "User",
default: null,
},
createdAt: { type: Date, default: null },
reason: { type: String, default: null },
},
},
{ timestamps: true }
);

// Compound index for unique table numbers per floor
tableSchema.index({ tableNumber: 1, floor: 1 }, { unique: true });
tableSchema.index({ floor: 1, isActive: 1 });
tableSchema.index({ status: 1 });
tableSchema.index({ assignedStaff: 1 });

// Pre-save validation
tableSchema.pre("save", async function (next) {
// Validate merged tables
if (this.isMerged && (!this.mergedWith || this.mergedWith.length === 0)) {
throw new Error("Merged table must have mergedWith references");
}

// Validate status transitions
if (this.isModified("status")) {
const oldStatus = this.\_original?.status;
const newStatus = this.status;

    // Can't set to occupied without an order
    if (newStatus === "occupied" && !this.currentOrder) {
      throw new Error("Cannot set status to occupied without an order");
    }

    // Can't set to ordered without an order
    if (newStatus === "ordered" && !this.currentOrder) {
      throw new Error("Cannot set status to ordered without an order");
    }

}

next();
});

// Store original document before save for validation
tableSchema.pre("save", function (next) {
if (!this.isNew) {
this.\_original = this.constructor
.findById(this.\_id)
.lean()
.exec()
.then((doc) => {
this.\_original = doc;
next();
})
.catch(next);
} else {
next();
}
});

module.exports = mongoose.model("Table", tableSchema);
backend/models/Reservation.js
javascript// backend/models/Reservation.js
const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
{
reservationNumber: {
type: String,
required: true,
unique: true,
},
customer: {
name: { type: String, required: true },
phone: { type: String, required: true },
email: { type: String },
},
customerId: {
type: mongoose.Schema.Types.ObjectId,
ref: "Customer",
default: null,
},
table: {
type: mongoose.Schema.Types.ObjectId,
ref: "Table",
required: true,
},
floor: {
type: mongoose.Schema.Types.ObjectId,
ref: "Floor",
required: true,
},
date: {
type: Date,
required: true,
},
time: {
type: String,
required: true,
},
duration: {
type: Number,
default: 120, // minutes
},
partySize: {
type: Number,
required: true,
min: 1,
},
status: {
type: String,
enum: ["pending", "confirmed", "seated", "completed", "cancelled", "no-show"],
default: "pending",
},
specialRequests: {
type: String,
default: "",
},
notes: {
type: String,
default: "",
},
createdBy: {
type: mongoose.Schema.Types.ObjectId,
ref: "User",
required: true,
},
confirmedBy: {
type: mongoose.Schema.Types.ObjectId,
ref: "User",
default: null,
},
seatedAt: {
type: Date,
default: null,
},
completedAt: {
type: Date,
default: null,
},
order: {
type: mongoose.Schema.Types.ObjectId,
ref: "Order",
default: null,
},
lastAction: {
action: {
type: String,
enum: ["create", "update", "confirm", "seat", "complete", "cancel"],
default: null,
},
performedBy: {
type: mongoose.Schema.Types.ObjectId,
ref: "User",
default: null,
},
createdAt: { type: Date, default: null },
reason: { type: String, default: null },
},
},
{ timestamps: true }
);

// Generate reservation number
reservationSchema.pre("save", async function (next) {
if (this.isNew && !this.reservationNumber) {
const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
const count = await this.constructor.countDocuments({
createdAt: {
$gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    });
    this.reservationNumber = `RES${dateStr}${(count + 1)
.toString()
.padStart(3, "0")}`;
}
next();
});

reservationSchema.index({ reservationNumber: 1 });
reservationSchema.index({ table: 1, date: 1 });
reservationSchema.index({ status: 1 });
reservationSchema.index({ date: 1 });
reservationSchema.index({ "customer.phone": 1 });

module.exports = mongoose.model("Reservation", reservationSchema); 2. Backend Controllers
backend/controllers/floorController.js
javascript// backend/controllers/floorController.js
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
backend/controllers/tableController.js
javascript// backend/controllers/tableController.js
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
      success: trueRetryThis response paused because Claude reached its max length for a message. Hit continue to nudge Claude along.Continue
