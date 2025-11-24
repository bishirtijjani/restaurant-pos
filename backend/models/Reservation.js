// backend/models/Reservation.js
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

module.exports = mongoose.model("Reservation", reservationSchema);