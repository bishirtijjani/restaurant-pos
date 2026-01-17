const mongoose = require("mongoose");

const deviceStatusSchema = new mongoose.Schema(
  {
    // Tenant information
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
    // Device identification
    deviceId: {
      type: String,
      required: true,
      index: true,
    },
    deviceType: {
      type: String,
      enum: ["pos", "kds", "tablet", "printer", "other"],
      required: true,
    },
    deviceName: {
      type: String,
    },
    // User information
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Connection status
    status: {
      type: String,
      enum: ["online", "offline", "idle", "error"],
      default: "offline",
      index: true,
    },
    lastHeartbeat: {
      type: Date,
      default: Date.now,
      index: true,
    },
    lastOnline: {
      type: Date,
    },
    lastOffline: {
      type: Date,
    },
    // Network information
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    // Application information
    appVersion: {
      type: String,
    },
    platform: {
      type: String, // 'web', 'ios', 'android', 'windows', 'macos'
    },
    // Offline mode tracking
    offlineMode: {
      type: Boolean,
      default: false,
    },
    offlineSince: {
      type: Date,
    },
    pendingSyncCount: {
      type: Number,
      default: 0,
    },
    lastSyncTime: {
      type: Date,
    },
    // Performance metrics
    performance: {
      avgResponseTime: { type: Number }, // Milliseconds
      errorCount: { type: Number, default: 0 },
      lastError: {
        message: String,
        timestamp: Date,
      },
    },
    // Additional metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Uptime tracking
    totalUptime: {
      type: Number,
      default: 0, // Seconds
    },
    sessionStart: {
      type: Date,
    },
    sessionDuration: {
      type: Number, // Seconds
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
deviceStatusSchema.index({ organizationId: 1, storeId: 1, status: 1 });
deviceStatusSchema.index(
  { deviceId: 1, organizationId: 1, storeId: 1 },
  { unique: true }
);
deviceStatusSchema.index({ lastHeartbeat: 1 });

// Static method to update heartbeat
deviceStatusSchema.statics.updateHeartbeat = async function (
  deviceId,
  organizationId,
  storeId,
  deviceData = {}
) {
  const now = new Date();

  const device = await this.findOneAndUpdate(
    { deviceId, organizationId, storeId },
    {
      $set: {
        lastHeartbeat: now,
        status: "online",
        lastOnline: now,
        ...deviceData,
      },
      $setOnInsert: {
        sessionStart: now,
      },
    },
    { upsert: true, new: true }
  );

  return device;
};

// Static method to get devices by store
deviceStatusSchema.statics.getStoreDevices = async function (
  organizationId,
  storeId,
  status = null
) {
  const query = { organizationId, storeId };
  if (status) {
    query.status = status;
  }

  return this.find(query)
    .populate("userId", "fullname email")
    .sort({ status: 1, lastHeartbeat: -1 })
    .lean();
};

// Static method to mark stale devices as offline
deviceStatusSchema.statics.markStaleDevicesOffline = async function (
  timeoutSeconds = 120
) {
  const cutoffTime = new Date(Date.now() - timeoutSeconds * 1000);

  const result = await this.updateMany(
    {
      status: "online",
      lastHeartbeat: { $lt: cutoffTime },
    },
    {
      $set: {
        status: "offline",
        lastOffline: new Date(),
      },
    }
  );

  return result;
};

// Static method to get device statistics
deviceStatusSchema.statics.getStatistics = async function (
  organizationId,
  storeId
) {
  const devices = await this.find({ organizationId, storeId }).lean();

  return {
    total: devices.length,
    online: devices.filter((d) => d.status === "online").length,
    offline: devices.filter((d) => d.status === "offline").length,
    idle: devices.filter((d) => d.status === "idle").length,
    error: devices.filter((d) => d.status === "error").length,
    offlineMode: devices.filter((d) => d.offlineMode).length,
    pendingSync: devices.reduce((sum, d) => sum + (d.pendingSyncCount || 0), 0),
  };
};

// Instance method to go offline
deviceStatusSchema.methods.goOffline = async function () {
  this.status = "offline";
  this.lastOffline = new Date();

  // Calculate session duration
  if (this.sessionStart) {
    const sessionDuration = Math.floor(
      (this.lastOffline - this.sessionStart) / 1000
    );
    this.sessionDuration = sessionDuration;
    this.totalUptime += sessionDuration;
  }

  return this.save();
};

// Instance method to enable offline mode
deviceStatusSchema.methods.enableOfflineMode = async function () {
  this.offlineMode = true;
  this.offlineSince = new Date();
  return this.save();
};

// Instance method to disable offline mode
deviceStatusSchema.methods.disableOfflineMode = async function () {
  this.offlineMode = false;
  this.offlineSince = null;
  return this.save();
};

module.exports =
  mongoose.models.DeviceStatus ||
  mongoose.model("DeviceStatus", deviceStatusSchema);
