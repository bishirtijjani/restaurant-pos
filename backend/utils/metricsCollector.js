// backend/utils/metricsCollector.js
// Platform-level metrics collection utility

const os = require("os");
const mongoose = require("mongoose");
const HealthMetrics = require("../models/HealthMetrics");
const logger = require("./logger");

/**
 * Collect system metrics (CPU, memory, disk)
 */
const collectSystemMetrics = () => {
  try {
    const cpus = os.cpus();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const loadAvg = os.loadavg();

    // Calculate CPU usage
    let totalIdle = 0;
    let totalTick = 0;
    cpus.forEach((cpu) => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });
    const cpuUsage = 100 - ~~((100 * totalIdle) / totalTick);

    // Disk usage (simplified - in production, use a library like 'diskusage')
    // For now, we'll use placeholder values
    const diskTotal = 500 * 1024 * 1024 * 1024; // 500GB placeholder
    const diskUsed = diskTotal * 0.4; // 40% placeholder
    const diskFree = diskTotal - diskUsed;

    return {
      cpu: {
        usage: Math.min(100, Math.max(0, cpuUsage)),
        cores: cpus.length,
        loadAverage: loadAvg,
      },
      memory: {
        used: usedMem,
        total: totalMem,
        percentage: Math.round((usedMem / totalMem) * 100),
        free: freeMem,
      },
      disk: {
        used: diskUsed,
        total: diskTotal,
        percentage: Math.round((diskUsed / diskTotal) * 100),
        free: diskFree,
      },
      uptime: os.uptime(),
    };
  } catch (error) {
    logger.error("Error collecting system metrics", { error: error.message });
    return null;
  }
};

/**
 * Collect database metrics
 */
const collectDatabaseMetrics = async () => {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      return null;
    }

    // Connection pool stats
    const poolStats = {
      active: mongoose.connection.readyState === 1 ? 1 : 0,
      idle: 0,
      total: 1,
      waiting: 0,
    };

    // Get database stats
    const stats = await db.stats();

    // Query latency (simplified - in production, track actual query times)
    // For now, we'll use placeholder values
    const queryLatency = {
      p50: 10,
      p95: 25,
      p99: 50,
      max: 100,
    };

    return {
      connectionPool: poolStats,
      queryLatency,
      slowQueries: 0, // Placeholder
      operations: {
        reads: 0,
        writes: 0,
        total: 0,
      },
      size: stats.dataSize + stats.indexSize,
    };
  } catch (error) {
    logger.error("Error collecting database metrics", { error: error.message });
    return null;
  }
};

/**
 * Collect API metrics from in-memory store
 * This should be populated by middleware tracking requests
 */
let apiMetricsStore = {
  requestCount: 0,
  errorCount: 0,
  totalResponseTime: 0,
  activeRequests: 0,
  statusCodes: {
    "2xx": 0,
    "3xx": 0,
    "4xx": 0,
    "5xx": 0,
  },
  endpoints: new Map(), // Track per-endpoint metrics
  windowStart: Date.now(),
};

const collectAPIMetrics = () => {
  try {
    const windowDuration = (Date.now() - apiMetricsStore.windowStart) / 1000; // seconds
    const requestRate =
      windowDuration > 0 ? apiMetricsStore.requestCount / windowDuration : 0;
    const errorRate =
      apiMetricsStore.requestCount > 0
        ? (apiMetricsStore.errorCount / apiMetricsStore.requestCount) * 100
        : 0;
    const avgResponseTime =
      apiMetricsStore.requestCount > 0
        ? apiMetricsStore.totalResponseTime / apiMetricsStore.requestCount
        : 0;

    // Get slowest endpoints
    const slowestEndpoints = Array.from(apiMetricsStore.endpoints.entries())
      .map(([path, data]) => ({
        path,
        method: data.method,
        avgTime: data.totalTime / data.count,
        count: data.count,
      }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 5);

    const metrics = {
      requestRate: Math.round(requestRate * 100) / 100,
      errorRate: Math.round(errorRate * 100) / 100,
      avgResponseTime: Math.round(avgResponseTime),
      activeRequests: apiMetricsStore.activeRequests,
      totalRequests: apiMetricsStore.requestCount,
      totalErrors: apiMetricsStore.errorCount,
      statusCodes: { ...apiMetricsStore.statusCodes },
      slowestEndpoints,
    };

    return metrics;
  } catch (error) {
    logger.error("Error collecting API metrics", { error: error.message });
    return null;
  }
};

/**
 * Reset API metrics window
 */
const resetAPIMetrics = () => {
  apiMetricsStore = {
    requestCount: 0,
    errorCount: 0,
    totalResponseTime: 0,
    activeRequests: 0,
    statusCodes: {
      "2xx": 0,
      "3xx": 0,
      "4xx": 0,
      "5xx": 0,
    },
    endpoints: new Map(),
    windowStart: Date.now(),
  };
};

/**
 * Track API request (called by middleware)
 */
const trackAPIRequest = (req, res, duration) => {
  apiMetricsStore.requestCount++;
  apiMetricsStore.totalResponseTime += duration;

  const statusCode = res.statusCode;
  if (statusCode >= 500) {
    apiMetricsStore.errorCount++;
    apiMetricsStore.statusCodes["5xx"]++;
  } else if (statusCode >= 400) {
    apiMetricsStore.statusCodes["4xx"]++;
  } else if (statusCode >= 300) {
    apiMetricsStore.statusCodes["3xx"]++;
  } else if (statusCode >= 200) {
    apiMetricsStore.statusCodes["2xx"]++;
  }

  // Track per-endpoint metrics
  const endpoint = `${req.method} ${req.route?.path || req.path}`;
  if (!apiMetricsStore.endpoints.has(endpoint)) {
    apiMetricsStore.endpoints.set(endpoint, {
      method: req.method,
      count: 0,
      totalTime: 0,
    });
  }
  const endpointData = apiMetricsStore.endpoints.get(endpoint);
  endpointData.count++;
  endpointData.totalTime += duration;
};

/**
 * Increment active requests
 */
const incrementActiveRequests = () => {
  apiMetricsStore.activeRequests++;
};

/**
 * Decrement active requests
 */
const decrementActiveRequests = () => {
  apiMetricsStore.activeRequests = Math.max(
    0,
    apiMetricsStore.activeRequests - 1,
  );
};

/**
 * Collect WebSocket metrics from WebSocket manager
 */
let websocketMetricsStore = {
  activeConnections: 0,
  totalConnections: 0,
  messagesReceived: 0,
  messagesSent: 0,
  errors: 0,
  reconnections: 0,
  windowStart: Date.now(),
};

const collectWebSocketMetrics = () => {
  try {
    const windowDuration =
      (Date.now() - websocketMetricsStore.windowStart) / 1000;
    const messageRate =
      windowDuration > 0
        ? (websocketMetricsStore.messagesReceived +
            websocketMetricsStore.messagesSent) /
          windowDuration
        : 0;

    return {
      activeConnections: websocketMetricsStore.activeConnections,
      totalConnections: websocketMetricsStore.totalConnections,
      messageRate: Math.round(messageRate * 100) / 100,
      messagesReceived: websocketMetricsStore.messagesReceived,
      messagesSent: websocketMetricsStore.messagesSent,
      errors: websocketMetricsStore.errors,
      reconnections: websocketMetricsStore.reconnections,
    };
  } catch (error) {
    logger.error("Error collecting WebSocket metrics", {
      error: error.message,
    });
    return null;
  }
};

/**
 * Update WebSocket metrics (called by WebSocket manager)
 */
const updateWebSocketMetrics = (updates) => {
  Object.assign(websocketMetricsStore, updates);
};

/**
 * Reset WebSocket metrics window
 */
const resetWebSocketMetrics = () => {
  websocketMetricsStore = {
    activeConnections: websocketMetricsStore.activeConnections, // Keep current connections
    totalConnections: 0,
    messagesReceived: 0,
    messagesSent: 0,
    errors: 0,
    reconnections: 0,
    windowStart: Date.now(),
  };
};

/**
 * Collect queue metrics (Bull)
 */
const collectQueueMetrics = async () => {
  try {
    // Placeholder - implement when Bull queue is integrated
    return {
      pending: 0,
      active: 0,
      completed: 0,
      failed: 0,
      delayed: 0,
      waiting: 0,
      avgProcessingTime: 0,
      jobRate: 0,
    };
  } catch (error) {
    logger.error("Error collecting queue metrics", { error: error.message });
    return null;
  }
};

/**
 * Collect tenant statistics
 */
const collectTenantMetrics = async () => {
  try {
    const Organization = require("../models/Organization");
    const User = require("../models/User");
    const Order = require("../models/Order");

    const [totalOrgs, activeUsers, orderStats] = await Promise.all([
      Organization.countDocuments({ deletedAt: null }),
      User.countDocuments({
        updatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      }),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: "$finalTotal" },
          },
        },
      ]),
    ]);

    return {
      total: totalOrgs,
      active: totalOrgs, // Simplified - all orgs considered active
      activeUsers,
      totalOrders: orderStats[0]?.totalOrders || 0,
      totalRevenue: orderStats[0]?.totalRevenue || 0,
    };
  } catch (error) {
    logger.error("Error collecting tenant metrics", { error: error.message });
    return null;
  }
};

/**
 * Collect all platform metrics and save to database
 */
const collectAndSaveMetrics = async () => {
  try {
    const timestamp = new Date();

    // Collect all metrics in parallel
    const [
      systemMetrics,
      databaseMetrics,
      apiMetrics,
      websocketMetrics,
      queueMetrics,
      tenantMetrics,
    ] = await Promise.all([
      Promise.resolve(collectSystemMetrics()),
      collectDatabaseMetrics(),
      Promise.resolve(collectAPIMetrics()),
      Promise.resolve(collectWebSocketMetrics()),
      collectQueueMetrics(),
      collectTenantMetrics(),
    ]);

    // Save system metrics
    if (systemMetrics) {
      await HealthMetrics.create({
        timestamp,
        type: "system",
        system: systemMetrics,
        tenants: tenantMetrics,
      });
    }

    // Save database metrics
    if (databaseMetrics) {
      await HealthMetrics.create({
        timestamp,
        type: "database",
        database: databaseMetrics,
      });
    }

    // Save API metrics
    if (apiMetrics) {
      await HealthMetrics.create({
        timestamp,
        type: "api",
        api: apiMetrics,
      });
    }

    // Save WebSocket metrics
    if (websocketMetrics) {
      await HealthMetrics.create({
        timestamp,
        type: "websocket",
        websocket: websocketMetrics,
      });
    }

    // Save queue metrics
    if (queueMetrics) {
      await HealthMetrics.create({
        timestamp,
        type: "queue",
        queue: queueMetrics,
      });
    }

    logger.debug("Platform metrics collected and saved");

    // Reset windowed metrics
    resetAPIMetrics();
    resetWebSocketMetrics();

    return true;
  } catch (error) {
    logger.error("Error collecting and saving metrics", {
      error: error.message,
    });
    return false;
  }
};

/**
 * Get latest metrics of all types
 */
const getLatestMetrics = async () => {
  try {
    const [system, database, api, websocket, queue] = await Promise.all([
      HealthMetrics.getLatest("system"),
      HealthMetrics.getLatest("database"),
      HealthMetrics.getLatest("api"),
      HealthMetrics.getLatest("websocket"),
      HealthMetrics.getLatest("queue"),
    ]);

    return {
      system: system?.system || {},
      database: database?.database || {},
      api: api?.api || {},
      websocket: websocket?.websocket || {},
      queue: queue?.queue || {},
      tenants: system?.tenants || {},
      timestamp: system?.timestamp || new Date(),
    };
  } catch (error) {
    logger.error("Error getting latest metrics", { error: error.message });
    return {
      system: {},
      database: {},
      api: {},
      websocket: {},
      queue: {},
      tenants: {},
      timestamp: new Date(),
    };
  }
};

/**
 * Get historical metrics for a time range
 */
const getHistoricalMetrics = async (type, startTime, endTime) => {
  try {
    return await HealthMetrics.getTimeRange(type, startTime, endTime);
  } catch (error) {
    logger.error("Error getting historical metrics", { error: error.message });
    return [];
  }
};

module.exports = {
  collectSystemMetrics,
  collectDatabaseMetrics,
  collectAPIMetrics,
  collectWebSocketMetrics,
  collectQueueMetrics,
  collectTenantMetrics,
  collectAndSaveMetrics,
  getLatestMetrics,
  getHistoricalMetrics,
  trackAPIRequest,
  incrementActiveRequests,
  decrementActiveRequests,
  updateWebSocketMetrics,
  resetAPIMetrics,
  resetWebSocketMetrics,
};
