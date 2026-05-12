const mongoose = require("mongoose");

const idempotencyKeySchema = new mongoose.Schema({
  key: { type: String, required: true },
  scopeId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId },
  method: String,
  path: String,
  requestHash: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "completed"],
    default: "pending",
    required: true,
  },
  statusCode: Number,
  responseBody: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now, expires: 48 * 60 * 60 },
});

idempotencyKeySchema.index({ key: 1, scopeId: 1 }, { unique: true });

module.exports =
  mongoose.models.IdempotencyKey ||
  mongoose.model("IdempotencyKey", idempotencyKeySchema);
