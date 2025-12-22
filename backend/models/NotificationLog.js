const mongoose = require("mongoose");

const notificationLogSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
    channel: {
      type: String,
      enum: ["email", "sms", "whatsapp"],
      required: true,
      index: true,
    },
    recipient: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
    },
    content: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["sent", "failed", "pending"],
      default: "pending",
    },
    provider: {
      type: String,
      required: true,
    },
    providerMessageId: {
      type: String,
    },
    error: {
      type: String,
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
    sentAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

notificationLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("NotificationLog", notificationLogSchema);
