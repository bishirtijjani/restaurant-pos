const mongoose = require("mongoose");

const healthMetricsSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["system", "database", "api", "websocket", "queue", "aggregate"],
      required: true,
      index: true,
    },
    // System metrics (CPU, memory, disk)
    system: {
      cpu: {
        usage: { type: Number, min: 0, max: 100 }, // Percentage
        cores: { type: Number },
        loadAverage: [Number], // 1, 5, 15 minute load averages
      },
      memory: {
        used: { type: Number }, // Bytes
        total: { type: Number }, // Bytes
        percentage: { type: Number, min: 0, max: 100 },
        free: { type: Number }, // Bytes
      },
      disk: {
        used: { type: Number }, // Bytes
        total: { type: Number }, // Bytes
        percentage: { type: Number, min: 0, max: 100 },
        free: { type: Number }, // Bytes
      },
      uptime: { type: Number }, // Seconds
    },
    // Database metrics
    database: {
      connectionPool: {
        active: { type: Number },
        idle: { type: Number },
        total: { type: Number },
        waiting: { type: Number },
      },
      queryLatency: {
        p50: { type: Number }, // Milliseconds
        p95: { type: Number },
        p99: { type: Number },
        max: { type: Number },
      },
      slowQueries: { type: Number }, // Count of queries > 100ms
      operations: {
        reads: { type: Number },
        writes: { type: Number },
        total: { type: Number },
      },
      size: { type: Number }, // Database size in bytes
    },
    // API metrics
    api: {
      requestRate: { type: Number }, // Requests per second
      errorRate: { type: Number }, // Percentage
      avgResponseTime: { type: Number }, // Milliseconds
      activeRequests: { type: Number },
      totalRequests: { type: Number },
      totalErrors: { type: Number },
      statusCodes: {
        "2xx": { type: Number },
        "3xx": { type: Number },
        "4xx": { type: Number },
        "5xx": { type: Number },
      },
      slowestEndpoints: [
        {
          path: String,
          method: String,
          avgTime: Number,
          count: Number,
        },
      ],
    },
    // WebSocket metrics
    websocket: {
      activeConnections: { type: Number },
      totalConnections: { type: Number },
      messageRate: { type: Number }, // Messages per second
      messagesReceived: { type: Number },
      messagesSent: { type: Number },
      errors: { type: Number },
      reconnections: { type: Number },
    },
    // Queue metrics (Bull)
    queue: {
      pending: { type: Number },
      active: { type: Number },
      completed: { type: Number },
      failed: { type: Number },
      delayed: { type: Number },
      waiting: { type: Number },
      avgProcessingTime: { type: Number }, // Milliseconds
      jobRate: { type: Number }, // Jobs per second
    },
    // Multi-tenant metrics
    tenants: {
      total: { type: Number },
      active: { type: Number }, // Active in last 24 hours
      activeUsers: { type: Number },
      totalOrders: { type: Number },
      totalRevenue: { type: Number },
    },
    // External services health
    externalServices: {
      stripe: {
        status: { type: String, enum: ["healthy", "degraded", "down"] },
        responseTime: { type: Number },
        lastCheck: { type: Date },
      },
      email: {
        status: { type: String, enum: ["healthy", "degraded", "down"] },
        lastCheck: { type: Date },
      },
      sms: {
        status: { type: String, enum: ["healthy", "degraded", "down"] },
        lastCheck: { type: Date },
      },
    },
    // Aggregation metadata (for aggregated metrics)
    aggregation: {
      level: {
        type: String,
        enum: ["raw", "5min", "1hour", "1day"],
        default: "raw",
      },
      startTime: { type: Date },
      endTime: { type: Date },
      sampleCount: { type: Number },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
healthMetricsSchema.index({ timestamp: -1, type: 1 });
healthMetricsSchema.index({ "aggregation.level": 1, timestamp: -1 });
healthMetricsSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 }); // Auto-delete after 7 days for raw data

// Static method to get latest metrics by type
healthMetricsSchema.statics.getLatest = async function (type) {
  return this.findOne({ type }).sort({ timestamp: -1 }).lean();
};

// Static method to get metrics in time range
healthMetricsSchema.statics.getTimeRange = async function (
  type,
  startTime,
  endTime,
  aggregationLevel = "raw"
) {
  return this.find({
    type,
    timestamp: { $gte: startTime, $lte: endTime },
    "aggregation.level": aggregationLevel,
  })
    .sort({ timestamp: 1 })
    .lean();
};

// Static method to get aggregated metrics
healthMetricsSchema.statics.getAggregated = async function (
  type,
  startTime,
  endTime,
  interval = "5min"
) {
  const aggregationLevel =
    interval === "1hour" ? "1hour" : interval === "1day" ? "1day" : "5min";

  return this.find({
    type,
    timestamp: { $gte: startTime, $lte: endTime },
    "aggregation.level": aggregationLevel,
  })
    .sort({ timestamp: 1 })
    .lean();
};

module.exports =
  mongoose.models.HealthMetrics ||
  mongoose.model("HealthMetrics", healthMetricsSchema);
