// backend/models/Table.js
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
const oldStatus = this._original?.status;
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
this._original = this.constructor
.findById(this._id)
.lean()
.exec()
.then((doc) => {
this._original = doc;
next();
})
.catch(next);
} else {
next();
}
});

module.exports = mongoose.model("Table", tableSchema);