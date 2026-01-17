// backend/services/healthMonitor.js
// Background health monitoring service

const logger = require("../utils/logger");
const metricsCollector = require("../utils/metricsCollector");
const alertManager = require("../utils/alertManager");
const DeviceStatus = require("../models/DeviceStatus");

let monitoringInterval = null;
let deviceCheckInterval = null;
let isMonitoring = false;

/**
 * Start the health monitoring service
 */
const startMonitoring = () => {
  if (isMonitoring) {
    logger.warn("Health monitoring already running");
    return;
  }

  logger.info("Starting health monitoring service");
  isMonitoring = true;

  // Collect metrics every 30 seconds
  const metricsIntervalMs =
    parseInt(process.env.METRICS_COLLECTION_INTERVAL || "30") * 1000;

  monitoringInterval = setInterval(async () => {
    try {
      // Collect and save all platform metrics
      await metricsCollector.collectAndSaveMetrics();

      // Get latest metrics for alert checking
      const latestMetrics = await metricsCollector.getLatestMetrics();

      // Check metrics against thresholds and create alerts
      await alertManager.checkMetricsAndAlert(latestMetrics);
    } catch (error) {
      logger.error("Error in health monitoring cycle", {
        error: error.message,
      });
    }
  }, metricsIntervalMs);

  // Check for stale devices every 60 seconds
  const deviceCheckIntervalMs =
    parseInt(process.env.DEVICE_CHECK_INTERVAL || "60") * 1000;

  deviceCheckInterval = setInterval(async () => {
    try {
      await checkStaleDevices();
    } catch (error) {
      logger.error("Error checking stale devices", { error: error.message });
    }
  }, deviceCheckIntervalMs);

  logger.info("Health monitoring service started", {
    metricsInterval: `${metricsIntervalMs / 1000}s`,
    deviceCheckInterval: `${deviceCheckIntervalMs / 1000}s`,
  });
};

/**
 * Stop the health monitoring service
 */
const stopMonitoring = () => {
  if (!isMonitoring) {
    return;
  }

  logger.info("Stopping health monitoring service");

  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
  }

  if (deviceCheckInterval) {
    clearInterval(deviceCheckInterval);
    deviceCheckInterval = null;
  }

  isMonitoring = false;
  logger.info("Health monitoring service stopped");
};

/**
 * Check for stale devices and mark them offline
 */
const checkStaleDevices = async () => {
  try {
    const timeoutSeconds = parseInt(
      process.env.DEVICE_HEARTBEAT_TIMEOUT || "120"
    );

    const result = await DeviceStatus.markStaleDevicesOffline(timeoutSeconds);

    if (result.modifiedCount > 0) {
      logger.info("Marked stale devices as offline", {
        count: result.modifiedCount,
      });

      // Get the devices that went offline
      const offlineDevices = await DeviceStatus.find({
        status: "offline",
        lastOffline: {
          $gte: new Date(Date.now() - timeoutSeconds * 1000),
        },
      })
        .populate("userId", "fullname")
        .lean();

      // Create alerts for offline devices
      for (const device of offlineDevices) {
        await alertManager.createAlert({
          level: "tenant",
          organizationId: device.organizationId,
          storeId: device.storeId,
          severity: "warning",
          type: "device_offline",
          title: `Device Offline: ${device.deviceName || device.deviceId}`,
          message: `Device ${device.deviceName || device.deviceId} (${
            device.deviceType
          }) has gone offline. Last seen: ${device.lastHeartbeat.toISOString()}`,
          metadata: {
            deviceId: device.deviceId,
            deviceType: device.deviceType,
            userId: device.userId,
            userName: device.userId?.fullname,
            lastHeartbeat: device.lastHeartbeat,
          },
        });
      }
    }
  } catch (error) {
    logger.error("Error checking stale devices", { error: error.message });
  }
};

/**
 * Auto-resolve alerts when conditions return to normal
 */
const autoResolveAlerts = async () => {
  try {
    const SystemAlert = require("../models/SystemAlert");

    // Get active platform alerts
    const activeAlerts = await SystemAlert.find({
      status: { $in: ["active", "acknowledged"] },
    }).lean();

    // Get current metrics
    const currentMetrics = await metricsCollector.getLatestMetrics();

    for (const alert of activeAlerts) {
      let shouldResolve = false;

      // Check if alert condition has cleared
      switch (alert.type) {
        case "cpu_high":
          if (
            currentMetrics.system?.cpu?.usage <
            alertManager.ALERT_THRESHOLDS.platform.cpu.warning
          ) {
            shouldResolve = true;
          }
          break;

        case "memory_high":
          if (
            currentMetrics.system?.memory?.percentage <
            alertManager.ALERT_THRESHOLDS.platform.memory.warning
          ) {
            shouldResolve = true;
          }
          break;

        case "disk_high":
          if (
            currentMetrics.system?.disk?.percentage <
            alertManager.ALERT_THRESHOLDS.platform.disk.warning
          ) {
            shouldResolve = true;
          }
          break;

        case "api_error_rate":
          if (
            currentMetrics.api?.errorRate <
            alertManager.ALERT_THRESHOLDS.platform.apiErrorRate.warning
          ) {
            shouldResolve = true;
          }
          break;

        case "db_slow":
          if (
            currentMetrics.database?.queryLatency?.p99 <
            alertManager.ALERT_THRESHOLDS.platform.dbQueryLatency.warning
          ) {
            shouldResolve = true;
          }
          break;

        case "device_offline":
          // Check if device is back online
          const device = await DeviceStatus.findOne({
            deviceId: alert.metadata?.deviceId,
            organizationId: alert.organizationId,
            storeId: alert.storeId,
          }).lean();

          if (device && device.status === "online") {
            shouldResolve = true;
          }
          break;
      }

      if (shouldResolve) {
        await alertManager.resolveAlert(
          alert._id,
          null,
          "Condition returned to normal",
          true
        );
        logger.info("Auto-resolved alert", {
          alertId: alert._id,
          type: alert.type,
        });
      }
    }
  } catch (error) {
    logger.error("Error auto-resolving alerts", { error: error.message });
  }
};

/**
 * Get monitoring status
 */
const getMonitoringStatus = () => {
  return {
    isMonitoring,
    metricsInterval: process.env.METRICS_COLLECTION_INTERVAL || "30",
    deviceCheckInterval: process.env.DEVICE_CHECK_INTERVAL || "60",
  };
};

/**
 * Perform health check
 */
const performHealthCheck = async () => {
  const checks = {
    database: false,
    metrics: false,
    monitoring: false,
  };

  try {
    // Check database connection
    const mongoose = require("mongoose");
    checks.database = mongoose.connection.readyState === 1;

    // Check if we can collect metrics
    const systemMetrics = metricsCollector.collectSystemMetrics();
    checks.metrics = systemMetrics !== null;

    // Check if monitoring is running
    checks.monitoring = isMonitoring;

    const isHealthy = Object.values(checks).every((check) => check === true);

    return {
      healthy: isHealthy,
      checks,
      timestamp: new Date(),
    };
  } catch (error) {
    logger.error("Error performing health check", { error: error.message });
    return {
      healthy: false,
      checks,
      error: error.message,
      timestamp: new Date(),
    };
  }
};

/**
 * Perform readiness check
 */
const performReadinessCheck = async () => {
  try {
    const mongoose = require("mongoose");
    const dbReady = mongoose.connection.readyState === 1;

    // Test database query
    let dbQueryOk = false;
    try {
      await mongoose.connection.db.admin().ping();
      dbQueryOk = true;
    } catch (error) {
      logger.error("Database ping failed", { error: error.message });
    }

    const ready = dbReady && dbQueryOk && isMonitoring;

    return {
      ready,
      checks: {
        database: dbReady,
        databaseQuery: dbQueryOk,
        monitoring: isMonitoring,
      },
      timestamp: new Date(),
    };
  } catch (error) {
    logger.error("Error performing readiness check", {
      error: error.message,
    });
    return {
      ready: false,
      error: error.message,
      timestamp: new Date(),
    };
  }
};

module.exports = {
  startMonitoring,
  stopMonitoring,
  checkStaleDevices,
  autoResolveAlerts,
  getMonitoringStatus,
  performHealthCheck,
  performReadinessCheck,
};
