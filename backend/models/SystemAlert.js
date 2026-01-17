const mongoose = require("mongoose");

const systemAlertSchema = new mongoose.Schema(
  {
    // Alert level: platform or tenant
    level: {
      type: String,
      enum: ["platform", "tenant"],
      required: true,
      index: true,
    },
    // Tenant information (null for platform alerts)
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      index: true,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      index: true,
    },
    // Alert severity
    severity: {
      type: String,
      enum: ["info", "warning", "critical"],
      required: true,
      index: true,
    },
    // Alert type/category
    type: {
      type: String,
      required: true,
      index: true,
      // Platform types: cpu_high, memory_high, disk_high, db_slow, api_error_rate, service_down
      // Tenant types: device_offline, printer_offline, sync_backlog, payment_failed, order_delayed
    },
    // Alert details
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    // Additional context
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Metric values that triggered the alert
    triggerValue: {
      type: Number,
    },
    threshold: {
      type: Number,
    },
    // Alert status
    status: {
      type: String,
      enum: ["active", "acknowledged", "resolved", "auto_resolved"],
      default: "active",
      index: true,
    },
    // Acknowledgment info
    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    acknowledgedAt: {
      type: Date,
    },
    acknowledgmentNote: {
      type: String,
    },
    // Resolution info
    resolvedAt: {
      type: Date,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    resolutionNote: {
      type: String,
    },
    autoResolved: {
      type: Boolean,
      default: false,
    },
    // Notification tracking
    notificationsSent: [
      {
        channel: {
          type: String,
          enum: ["email", "sms", "websocket", "webhook"],
        },
        recipient: String,
        sentAt: {
          type: Date,
          default: Date.now,
        },
        success: {
          type: Boolean,
          default: true,
        },
        error: String,
      },
    ],
    // Deduplication
    fingerprint: {
      type: String,
      index: true,
      // Hash of type + level + organizationId + storeId for deduplication
    },
    occurrenceCount: {
      type: Number,
      default: 1,
    },
    lastOccurrence: {
      type: Date,
      default: Date.now,
    },
    firstOccurrence: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
systemAlertSchema.index({ level: 1, status: 1, createdAt: -1 });
systemAlertSchema.index({ organizationId: 1, storeId: 1, status: 1 });
systemAlertSchema.index({ fingerprint: 1, status: 1 });
systemAlertSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // Auto-delete after 90 days

// Generate fingerprint for deduplication
systemAlertSchema.methods.generateFingerprint = function () {
  const parts = [
    this.type,
    this.level,
    this.organizationId?.toString() || "platform",
    this.storeId?.toString() || "all",
  ];
  return parts.join(":");
};

// Pre-save hook to generate fingerprint
systemAlertSchema.pre("save", function (next) {
  if (!this.fingerprint) {
    this.fingerprint = this.generateFingerprint();
  }
  next();
});

// Static method to get active alerts
systemAlertSchema.statics.getActive = async function (filters = {}) {
  const query = { status: "active", ...filters };
  return this.find(query)
    .sort({ severity: -1, createdAt: -1 })
    .populate("acknowledgedBy", "fullname email")
    .populate("resolvedBy", "fullname email")
    .lean();
};

// Static method to get alerts for a tenant
systemAlertSchema.statics.getTenantAlerts = async function (
  organizationId,
  storeId,
  status = "active"
) {
  return this.find({
    level: "tenant",
    organizationId,
    storeId,
    status,
  })
    .sort({ severity: -1, createdAt: -1 })
    .lean();
};

// Static method to get platform alerts
systemAlertSchema.statics.getPlatformAlerts = async function (
  status = "active"
) {
  return this.find({
    level: "platform",
    status,
  })
    .sort({ severity: -1, createdAt: -1 })
    .lean();
};

// Static method to find or create alert (for deduplication)
systemAlertSchema.statics.findOrCreate = async function (alertData) {
  const fingerprint = [
    alertData.type,
    alertData.level,
    alertData.organizationId?.toString() || "platform",
    alertData.storeId?.toString() || "all",
  ].join(":");

  // Look for active alert with same fingerprint within last 15 minutes
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
  const existingAlert = await this.findOne({
    fingerprint,
    status: "active",
    createdAt: { $gte: fifteenMinutesAgo },
  });

  if (existingAlert) {
    // Update existing alert
    existingAlert.occurrenceCount += 1;
    existingAlert.lastOccurrence = new Date();
    existingAlert.triggerValue = alertData.triggerValue;
    await existingAlert.save();
    return { alert: existingAlert, isNew: false };
  }

  // Create new alert
  const newAlert = await this.create({
    ...alertData,
    fingerprint,
    firstOccurrence: new Date(),
    lastOccurrence: new Date(),
  });
  return { alert: newAlert, isNew: true };
};

// Instance method to acknowledge alert
systemAlertSchema.methods.acknowledge = async function (userId, note = "") {
  this.status = "acknowledged";
  this.acknowledgedBy = userId;
  this.acknowledgedAt = new Date();
  this.acknowledgmentNote = note;
  return this.save();
};

// Instance method to resolve alert
systemAlertSchema.methods.resolve = async function (
  userId = null,
  note = "",
  autoResolved = false
) {
  this.status = autoResolved ? "auto_resolved" : "resolved";
  this.resolvedAt = new Date();
  this.resolvedBy = userId;
  this.resolutionNote = note;
  this.autoResolved = autoResolved;
  return this.save();
};

// Instance method to add notification record
systemAlertSchema.methods.addNotification = async function (
  channel,
  recipient,
  success,
  error = null
) {
  this.notificationsSent.push({
    channel,
    recipient,
    sentAt: new Date(),
    success,
    error,
  });
  return this.save();
};

module.exports =
  mongoose.models.SystemAlert ||
  mongoose.model("SystemAlert", systemAlertSchema);
