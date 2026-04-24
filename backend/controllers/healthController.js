// backend/controllers/healthController.js
// Platform and tenant health monitoring endpoints

const asyncHandler = require("express-async-handler");
const metricsCollector = require("../utils/metricsCollector");
const alertManager = require("../utils/alertManager");
const healthMonitor = require("../services/healthMonitor");
const DeviceStatus = require("../models/DeviceStatus");
const HealthMetrics = require("../models/HealthMetrics");
const SystemAlert = require("../models/SystemAlert");
const logger = require("../utils/logger");

// ============================================
// PLATFORM-LEVEL ENDPOINTS (Super-admin only)
// ============================================

/**
 * @desc    Basic health check (liveness probe)
 * @route   GET /api/platform/health
 * @access  Public
 */
const getBasicHealth = asyncHandler(async (req, res) => {
  const health = await healthMonitor.performHealthCheck();

  res.status(health.healthy ? 200 : 503).json({
    success: health.healthy,
    status: health.healthy ? "healthy" : "unhealthy",
    checks: health.checks,
    timestamp: health.timestamp,
  });
});

/**
 * @desc    Readiness check
 * @route   GET /api/platform/health/ready
 * @access  Public
 */
const getReadinessCheck = asyncHandler(async (req, res) => {
  const readiness = await healthMonitor.performReadinessCheck();

  res.status(readiness.ready ? 200 : 503).json({
    success: readiness.ready,
    ready: readiness.ready,
    checks: readiness.checks,
    timestamp: readiness.timestamp,
  });
});

/**
 * @desc    Get detailed platform health diagnostics
 * @route   GET /api/platform/health/detailed
 * @access  Super-admin
 */
const getDetailedHealth = asyncHandler(async (req, res) => {
  const [health, metrics, activeAlerts, monitoringStatus] = await Promise.all([
    healthMonitor.performHealthCheck(),
    metricsCollector.getLatestMetrics(),
    alertManager.getPlatformAlerts("active"),
    Promise.resolve(healthMonitor.getMonitoringStatus()),
  ]);

  res.json({
    success: true,
    health,
    metrics,
    activeAlerts: activeAlerts.length,
    alerts: activeAlerts.slice(0, 10), // Latest 10 alerts
    monitoring: monitoringStatus,
    timestamp: new Date(),
  });
});

/**
 * @desc    Get system metrics
 * @route   GET /api/platform/metrics/system
 * @access  Super-admin
 */
const getSystemMetrics = asyncHandler(async (req, res) => {
  const { timeRange = "1h" } = req.query;

  // Get latest metrics
  const latest = await metricsCollector.getLatestMetrics();

  // Get historical metrics
  const endTime = new Date();
  const startTime = new Date();

  switch (timeRange) {
    case "1h":
      startTime.setHours(startTime.getHours() - 1);
      break;
    case "6h":
      startTime.setHours(startTime.getHours() - 6);
      break;
    case "24h":
      startTime.setHours(startTime.getHours() - 24);
      break;
    case "7d":
      startTime.setDate(startTime.getDate() - 7);
      break;
    default:
      startTime.setHours(startTime.getHours() - 1);
  }

  const historical = await metricsCollector.getHistoricalMetrics(
    "system",
    startTime,
    endTime
  );

  res.json({
    success: true,
    latest: latest.system,
    historical: historical.map((m) => ({
      timestamp: m.timestamp,
      cpu: m.system?.cpu,
      memory: m.system?.memory,
      disk: m.system?.disk,
    })),
    timeRange,
  });
});

/**
 * @desc    Get database metrics
 * @route   GET /api/platform/metrics/database
 * @access  Super-admin
 */
const getDatabaseMetrics = asyncHandler(async (req, res) => {
  const { timeRange = "1h" } = req.query;

  const latest = await metricsCollector.getLatestMetrics();

  const endTime = new Date();
  const startTime = new Date();
  startTime.setHours(startTime.getHours() - parseInt(timeRange));

  const historical = await metricsCollector.getHistoricalMetrics(
    "database",
    startTime,
    endTime
  );

  res.json({
    success: true,
    latest: latest.database,
    historical: historical.map((m) => ({
      timestamp: m.timestamp,
      connectionPool: m.database?.connectionPool,
      queryLatency: m.database?.queryLatency,
      slowQueries: m.database?.slowQueries,
    })),
    timeRange,
  });
});

/**
 * @desc    Get API metrics
 * @route   GET /api/platform/metrics/api
 * @access  Super-admin
 */
const getAPIMetrics = asyncHandler(async (req, res) => {
  const { timeRange = "1h" } = req.query;

  const latest = await metricsCollector.getLatestMetrics();

  const endTime = new Date();
  const startTime = new Date();
  startTime.setHours(startTime.getHours() - parseInt(timeRange));

  const historical = await metricsCollector.getHistoricalMetrics(
    "api",
    startTime,
    endTime
  );

  res.json({
    success: true,
    latest: latest.api,
    historical: historical.map((m) => ({
      timestamp: m.timestamp,
      requestRate: m.api?.requestRate,
      errorRate: m.api?.errorRate,
      avgResponseTime: m.api?.avgResponseTime,
    })),
    timeRange,
  });
});

/**
 * @desc    Get tenant statistics
 * @route   GET /api/platform/metrics/tenants
 * @access  Super-admin
 */
const getTenantMetrics = asyncHandler(async (req, res) => {
  const latest = await metricsCollector.getLatestMetrics();

  res.json({
    success: true,
    tenants: latest.tenants,
    timestamp: latest.timestamp,
  });
});

/**
 * @desc    Get platform alerts
 * @route   GET /api/platform/alerts
 * @access  Super-admin
 */
const getPlatformAlerts = asyncHandler(async (req, res) => {
  const { status = "active", limit = 50 } = req.query;

  const alerts = await SystemAlert.find({
    level: "platform",
    status,
  })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .populate("acknowledgedBy", "fullname email")
    .populate("resolvedBy", "fullname email")
    .lean();

  res.json({
    success: true,
    alerts,
    count: alerts.length,
  });
});

/**
 * @desc    Acknowledge platform alert
 * @route   POST /api/platform/alerts/:id/acknowledge
 * @access  Super-admin
 */
const acknowledgePlatformAlert = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { note } = req.body;
  const userId = req.user._id;

  const alert = await alertManager.acknowledgeAlert(id, userId, note);

  res.json({
    success: true,
    message: "Alert acknowledged",
    alert,
  });
});

/**
 * @desc    Resolve platform alert
 * @route   POST /api/platform/alerts/:id/resolve
 * @access  Super-admin
 */
const resolvePlatformAlert = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { note } = req.body;
  const userId = req.user._id;

  const alert = await alertManager.resolveAlert(id, userId, note, false);

  res.json({
    success: true,
    message: "Alert resolved",
    alert,
  });
});

// ============================================
// TENANT-LEVEL ENDPOINTS
// ============================================

/**
 * @desc    Get tenant health overview
 * @route   GET /api/health/tenant
 * @access  Admin
 */
const getTenantHealth = asyncHandler(async (req, res) => {
  const { organizationId, storeId } = req.user.currentOrganization || {};

  if (!organizationId || !storeId) {
    res.status(400);
    throw new Error("Organization or store not found");
  }

  // Get device statistics
  const deviceStats = await DeviceStatus.getStatistics(organizationId, storeId);

  // Get active alerts
  const activeAlerts = await alertManager.getTenantAlerts(
    organizationId,
    storeId,
    "active"
  );

  // Get sync status (placeholder - implement based on your sync engine)
  const syncStatus = {
    pending: 0,
    failed: 0,
    lastSync: new Date(),
  };

  res.json({
    success: true,
    health: {
      devices: deviceStats,
      sync: syncStatus,
      alerts: {
        active: activeAlerts.length,
        critical: activeAlerts.filter((a) => a.severity === "critical").length,
        warning: activeAlerts.filter((a) => a.severity === "warning").length,
      },
    },
    timestamp: new Date(),
  });
});

/**
 * @desc    Get device status list
 * @route   GET /api/health/tenant/devices
 * @access  Admin
 */
const getTenantDevices = asyncHandler(async (req, res) => {
  const { organizationId, storeId } = req.user.currentOrganization || {};
  const { status } = req.query;

  const devices = await DeviceStatus.getStoreDevices(
    organizationId,
    storeId,
    status
  );

  res.json({
    success: true,
    devices,
    count: devices.length,
  });
});

/**
 * @desc    Send device heartbeat
 * @route   POST /api/health/tenant/devices/heartbeat
 * @access  Authenticated
 */
const sendDeviceHeartbeat = asyncHandler(async (req, res) => {
  const { organizationId, storeId } = req.user.currentOrganization || {};
  const {
    deviceId,
    deviceType,
    deviceName,
    offlineMode,
    pendingSyncCount,
    performance,
  } = req.body;

  const deviceData = {
    deviceType,
    deviceName,
    userId: req.user._id,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
    offlineMode: offlineMode || false,
    pendingSyncCount: pendingSyncCount || 0,
    performance,
  };

  const device = await DeviceStatus.updateHeartbeat(
    deviceId,
    organizationId,
    storeId,
    deviceData
  );

  res.json({
    success: true,
    message: "Heartbeat received",
    device: {
      deviceId: device.deviceId,
      status: device.status,
      lastHeartbeat: device.lastHeartbeat,
    },
  });
});

/**
 * @desc    Get tenant alerts
 * @route   GET /api/health/tenant/alerts
 * @access  Admin
 */
const getTenantAlerts = asyncHandler(async (req, res) => {
  const { organizationId, storeId } = req.user.currentOrganization || {};
  const { status = "active", limit = 50 } = req.query;

  const alerts = await SystemAlert.find({
    level: "tenant",
    organizationId,
    storeId,
    status,
  })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .populate("acknowledgedBy", "fullname email")
    .lean();

  res.json({
    success: true,
    alerts,
    count: alerts.length,
  });
});

/**
 * @desc    Acknowledge tenant alert
 * @route   POST /api/health/tenant/alerts/:id/acknowledge
 * @access  Admin
 */
const acknowledgeTenantAlert = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { note } = req.body;
  const userId = req.user._id;

  const alert = await alertManager.acknowledgeAlert(id, userId, note);

  res.json({
    success: true,
    message: "Alert acknowledged",
    alert,
  });
});

module.exports = {
  // Platform endpoints
  getBasicHealth,
  getReadinessCheck,
  getDetailedHealth,
  getSystemMetrics,
  getDatabaseMetrics,
  getAPIMetrics,
  getTenantMetrics,
  getPlatformAlerts,
  acknowledgePlatformAlert,
  resolvePlatformAlert,
  // Tenant endpoints
  getTenantHealth,
  getTenantDevices,
  sendDeviceHeartbeat,
  getTenantAlerts,
  acknowledgeTenantAlert,
};

