// backend/utils/alertManager.js
// Alert creation, delivery, and management

const SystemAlert = require("../models/SystemAlert");
const logger = require("./logger");
const communicationManager = require("./communicationManager");

// Alert thresholds configuration
const ALERT_THRESHOLDS = {
  platform: {
    cpu: {
      warning: parseInt(process.env.ALERT_CPU_WARNING || "70"),
      critical: parseInt(process.env.ALERT_CPU_CRITICAL || "85"),
    },
    memory: {
      warning: parseInt(process.env.ALERT_MEMORY_WARNING || "75"),
      critical: parseInt(process.env.ALERT_MEMORY_CRITICAL || "90"),
    },
    disk: {
      warning: parseInt(process.env.ALERT_DISK_WARNING || "80"),
      critical: parseInt(process.env.ALERT_DISK_CRITICAL || "95"),
    },
    apiErrorRate: {
      warning: parseFloat(process.env.ALERT_API_ERROR_WARNING || "2"),
      critical: parseFloat(process.env.ALERT_API_ERROR_CRITICAL || "5"),
    },
    dbQueryLatency: {
      warning: parseInt(process.env.ALERT_DB_LATENCY_WARNING || "100"),
      critical: parseInt(process.env.ALERT_DB_LATENCY_CRITICAL || "500"),
    },
  },
  tenant: {
    deviceOffline: {
      duration: parseInt(process.env.ALERT_DEVICE_OFFLINE_DURATION || "120"), // seconds
    },
    syncBacklog: {
      warning: parseInt(process.env.ALERT_SYNC_WARNING || "50"),
      critical: parseInt(process.env.ALERT_SYNC_CRITICAL || "100"),
    },
    orderProcessingTime: {
      warning: parseInt(process.env.ALERT_ORDER_TIME_WARNING || "300"), // seconds
      critical: parseInt(process.env.ALERT_ORDER_TIME_CRITICAL || "600"),
    },
    printerOffline: {
      duration: parseInt(process.env.ALERT_PRINTER_OFFLINE_DURATION || "60"), // seconds
    },
  },
};

/**
 * Create or update an alert with deduplication
 */
const createAlert = async (alertData) => {
  try {
    const { alert, isNew } = await SystemAlert.findOrCreate(alertData);

    if (isNew) {
      logger.info("New alert created", {
        type: alert.type,
        severity: alert.severity,
        level: alert.level,
      });

      // Send notifications for new alerts
      await sendAlertNotifications(alert);
    } else {
      logger.debug("Alert updated (deduplicated)", {
        type: alert.type,
        occurrenceCount: alert.occurrenceCount,
      });
    }

    return alert;
  } catch (error) {
    logger.error("Error creating alert", { error: error.message });
    throw error;
  }
};

/**
 * Send alert notifications via configured channels
 */
const sendAlertNotifications = async (alert) => {
  const notifications = [];

  try {
    // Only send notifications for warning and critical alerts
    if (alert.severity === "info") {
      return;
    }

    // Determine recipients based on alert level
    let recipients = [];
    if (alert.level === "platform") {
      // Send to super-admins (implement based on your user model)
      recipients = await getSuperAdminContacts();
    } else if (alert.level === "tenant") {
      // Send to tenant admins
      recipients = await getTenantAdminContacts(
        alert.organizationId,
        alert.storeId
      );
    }

    // Send email notifications
    if (process.env.ENABLE_EMAIL_ALERTS === "true") {
      for (const recipient of recipients) {
        if (recipient.email) {
          try {
            await sendEmailAlert(alert, recipient.email);
            notifications.push({
              channel: "email",
              recipient: recipient.email,
              success: true,
            });
          } catch (error) {
            logger.error("Failed to send email alert", {
              error: error.message,
              recipient: recipient.email,
            });
            notifications.push({
              channel: "email",
              recipient: recipient.email,
              success: false,
              error: error.message,
            });
          }
        }
      }
    }

    // Send SMS notifications for critical alerts
    if (
      process.env.ENABLE_SMS_ALERTS === "true" &&
      alert.severity === "critical"
    ) {
      for (const recipient of recipients) {
        if (recipient.phone) {
          try {
            await sendSMSAlert(alert, recipient.phone);
            notifications.push({
              channel: "sms",
              recipient: recipient.phone,
              success: true,
            });
          } catch (error) {
            logger.error("Failed to send SMS alert", {
              error: error.message,
              recipient: recipient.phone,
            });
            notifications.push({
              channel: "sms",
              recipient: recipient.phone,
              success: false,
              error: error.message,
            });
          }
        }
      }
    }

    // Send WebSocket notifications (real-time)
    await sendWebSocketAlert(alert);
    notifications.push({
      channel: "websocket",
      recipient: "broadcast",
      success: true,
    });

    // Update alert with notification records
    for (const notification of notifications) {
      await alert.addNotification(
        notification.channel,
        notification.recipient,
        notification.success,
        notification.error
      );
    }
  } catch (error) {
    logger.error("Error sending alert notifications", {
      error: error.message,
    });
  }
};

/**
 * Send email alert
 */
const sendEmailAlert = async (alert, recipientEmail) => {
  const subject = `[${alert.severity.toUpperCase()}] ${alert.title}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: ${getSeverityColor(
        alert.severity
      )}; color: white; padding: 20px; border-radius: 5px 5px 0 0;">
        <h2 style="margin: 0;">${alert.title}</h2>
        <p style="margin: 5px 0 0 0; opacity: 0.9;">Severity: ${alert.severity.toUpperCase()}</p>
      </div>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 0 0 5px 5px;">
        <p style="margin: 0 0 15px 0; font-size: 16px;">${alert.message}</p>
        ${
          alert.triggerValue
            ? `<p style="margin: 0 0 10px 0;"><strong>Current Value:</strong> ${alert.triggerValue}</p>`
            : ""
        }
        ${
          alert.threshold
            ? `<p style="margin: 0 0 10px 0;"><strong>Threshold:</strong> ${alert.threshold}</p>`
            : ""
        }
        <p style="margin: 15px 0 0 0; font-size: 12px; color: #666;">
          Alert ID: ${alert._id}<br>
          Time: ${alert.createdAt.toISOString()}<br>
          Type: ${alert.type}
        </p>
      </div>
    </div>
  `;

  await communicationManager.sendEmail({
    to: recipientEmail,
    subject,
    html,
  });
};

/**
 * Send SMS alert
 */
const sendSMSAlert = async (alert, recipientPhone) => {
  const message = `[${alert.severity.toUpperCase()}] ${alert.title}: ${
    alert.message
  }`;

  await communicationManager.sendSMS({
    to: recipientPhone,
    message: message.substring(0, 160), // SMS character limit
  });
};

/**
 * Send WebSocket alert
 */
const sendWebSocketAlert = async (alert) => {
  try {
    const { broadcastToChannel } = require("./webSocket");

    const channel =
      alert.level === "platform" ? "platform:alerts" : "tenant:alerts";
    const room =
      alert.level === "tenant"
        ? `${alert.organizationId}:${alert.storeId}`
        : "platform";

    broadcastToChannel(channel, room, {
      type: "new_alert",
      alert: {
        id: alert._id,
        severity: alert.severity,
        title: alert.title,
        message: alert.message,
        type: alert.type,
        createdAt: alert.createdAt,
      },
    });
  } catch (error) {
    logger.error("Error sending WebSocket alert", { error: error.message });
  }
};

/**
 * Get severity color for email styling
 */
const getSeverityColor = (severity) => {
  switch (severity) {
    case "critical":
      return "#dc2626";
    case "warning":
      return "#f59e0b";
    case "info":
      return "#3b82f6";
    default:
      return "#6b7280";
  }
};

/**
 * Get super-admin contacts
 */
const getSuperAdminContacts = async () => {
  try {
    const User = require("../models/User");
    // Implement based on your user model structure
    // For now, return users with admin role
    const admins = await User.find({ role: "admin", deletedAt: null })
      .select("fullname email")
      .lean();

    return admins;
  } catch (error) {
    logger.error("Error getting super-admin contacts", {
      error: error.message,
    });
    return [];
  }
};

/**
 * Get tenant admin contacts
 */
const getTenantAdminContacts = async (organizationId, storeId) => {
  try {
    const User = require("../models/User");
    const admins = await User.find({
      "stores.organizationId": organizationId,
      "stores.storeId": storeId,
      "stores.role": { $in: ["admin", "manager"] },
      deletedAt: null,
    })
      .select("fullname email")
      .lean();

    return admins;
  } catch (error) {
    logger.error("Error getting tenant admin contacts", {
      error: error.message,
    });
    return [];
  }
};

/**
 * Acknowledge an alert
 */
const acknowledgeAlert = async (alertId, userId, note = "") => {
  try {
    const alert = await SystemAlert.findById(alertId);
    if (!alert) {
      throw new Error("Alert not found");
    }

    await alert.acknowledge(userId, note);
    logger.info("Alert acknowledged", { alertId, userId });

    // Broadcast acknowledgment via WebSocket
    const { broadcastToChannel } = require("./webSocket");
    const channel =
      alert.level === "platform" ? "platform:alerts" : "tenant:alerts";
    const room =
      alert.level === "tenant"
        ? `${alert.organizationId}:${alert.storeId}`
        : "platform";

    broadcastToChannel(channel, room, {
      type: "alert_acknowledged",
      alertId: alert._id,
      acknowledgedBy: userId,
    });

    return alert;
  } catch (error) {
    logger.error("Error acknowledging alert", { error: error.message });
    throw error;
  }
};

/**
 * Resolve an alert
 */
const resolveAlert = async (
  alertId,
  userId = null,
  note = "",
  autoResolved = false
) => {
  try {
    const alert = await SystemAlert.findById(alertId);
    if (!alert) {
      throw new Error("Alert not found");
    }

    await alert.resolve(userId, note, autoResolved);
    logger.info("Alert resolved", { alertId, userId, autoResolved });

    // Broadcast resolution via WebSocket
    const { broadcastToChannel } = require("./webSocket");
    const channel =
      alert.level === "platform" ? "platform:alerts" : "tenant:alerts";
    const room =
      alert.level === "tenant"
        ? `${alert.organizationId}:${alert.storeId}`
        : "platform";

    broadcastToChannel(channel, room, {
      type: "alert_resolved",
      alertId: alert._id,
      resolvedBy: userId,
      autoResolved,
    });

    return alert;
  } catch (error) {
    logger.error("Error resolving alert", { error: error.message });
    throw error;
  }
};

/**
 * Get active alerts
 */
const getActiveAlerts = async (filters = {}) => {
  try {
    return await SystemAlert.getActive(filters);
  } catch (error) {
    logger.error("Error getting active alerts", { error: error.message });
    return [];
  }
};

/**
 * Get platform alerts
 */
const getPlatformAlerts = async (status = "active") => {
  try {
    return await SystemAlert.getPlatformAlerts(status);
  } catch (error) {
    logger.error("Error getting platform alerts", { error: error.message });
    return [];
  }
};

/**
 * Get tenant alerts
 */
const getTenantAlerts = async (organizationId, storeId, status = "active") => {
  try {
    return await SystemAlert.getTenantAlerts(organizationId, storeId, status);
  } catch (error) {
    logger.error("Error getting tenant alerts", { error: error.message });
    return [];
  }
};

/**
 * Check metrics against thresholds and create alerts
 */
const checkMetricsAndAlert = async (metrics) => {
  const alerts = [];

  try {
    // Check system metrics
    if (metrics.system) {
      // CPU check
      if (metrics.system.cpu?.usage >= ALERT_THRESHOLDS.platform.cpu.critical) {
        alerts.push(
          await createAlert({
            level: "platform",
            severity: "critical",
            type: "cpu_high",
            title: "Critical: CPU Usage Extremely High",
            message: `CPU usage is at ${metrics.system.cpu.usage}%, exceeding critical threshold of ${ALERT_THRESHOLDS.platform.cpu.critical}%`,
            triggerValue: metrics.system.cpu.usage,
            threshold: ALERT_THRESHOLDS.platform.cpu.critical,
            metadata: { cores: metrics.system.cpu.cores },
          })
        );
      } else if (
        metrics.system.cpu?.usage >= ALERT_THRESHOLDS.platform.cpu.warning
      ) {
        alerts.push(
          await createAlert({
            level: "platform",
            severity: "warning",
            type: "cpu_high",
            title: "Warning: CPU Usage High",
            message: `CPU usage is at ${metrics.system.cpu.usage}%, exceeding warning threshold of ${ALERT_THRESHOLDS.platform.cpu.warning}%`,
            triggerValue: metrics.system.cpu.usage,
            threshold: ALERT_THRESHOLDS.platform.cpu.warning,
            metadata: { cores: metrics.system.cpu.cores },
          })
        );
      }

      // Memory check
      if (
        metrics.system.memory?.percentage >=
        ALERT_THRESHOLDS.platform.memory.critical
      ) {
        alerts.push(
          await createAlert({
            level: "platform",
            severity: "critical",
            type: "memory_high",
            title: "Critical: Memory Usage Extremely High",
            message: `Memory usage is at ${metrics.system.memory.percentage}%, exceeding critical threshold of ${ALERT_THRESHOLDS.platform.memory.critical}%`,
            triggerValue: metrics.system.memory.percentage,
            threshold: ALERT_THRESHOLDS.platform.memory.critical,
          })
        );
      } else if (
        metrics.system.memory?.percentage >=
        ALERT_THRESHOLDS.platform.memory.warning
      ) {
        alerts.push(
          await createAlert({
            level: "platform",
            severity: "warning",
            type: "memory_high",
            title: "Warning: Memory Usage High",
            message: `Memory usage is at ${metrics.system.memory.percentage}%, exceeding warning threshold of ${ALERT_THRESHOLDS.platform.memory.warning}%`,
            triggerValue: metrics.system.memory.percentage,
            threshold: ALERT_THRESHOLDS.platform.memory.warning,
          })
        );
      }

      // Disk check
      if (
        metrics.system.disk?.percentage >=
        ALERT_THRESHOLDS.platform.disk.critical
      ) {
        alerts.push(
          await createAlert({
            level: "platform",
            severity: "critical",
            type: "disk_high",
            title: "Critical: Disk Space Critically Low",
            message: `Disk usage is at ${metrics.system.disk.percentage}%, exceeding critical threshold of ${ALERT_THRESHOLDS.platform.disk.critical}%`,
            triggerValue: metrics.system.disk.percentage,
            threshold: ALERT_THRESHOLDS.platform.disk.critical,
          })
        );
      } else if (
        metrics.system.disk?.percentage >=
        ALERT_THRESHOLDS.platform.disk.warning
      ) {
        alerts.push(
          await createAlert({
            level: "platform",
            severity: "warning",
            type: "disk_high",
            title: "Warning: Disk Space Low",
            message: `Disk usage is at ${metrics.system.disk.percentage}%, exceeding warning threshold of ${ALERT_THRESHOLDS.platform.disk.warning}%`,
            triggerValue: metrics.system.disk.percentage,
            threshold: ALERT_THRESHOLDS.platform.disk.warning,
          })
        );
      }
    }

    // Check API metrics
    if (metrics.api) {
      if (
        metrics.api.errorRate >= ALERT_THRESHOLDS.platform.apiErrorRate.critical
      ) {
        alerts.push(
          await createAlert({
            level: "platform",
            severity: "critical",
            type: "api_error_rate",
            title: "Critical: API Error Rate Extremely High",
            message: `API error rate is at ${metrics.api.errorRate}%, exceeding critical threshold of ${ALERT_THRESHOLDS.platform.apiErrorRate.critical}%`,
            triggerValue: metrics.api.errorRate,
            threshold: ALERT_THRESHOLDS.platform.apiErrorRate.critical,
          })
        );
      } else if (
        metrics.api.errorRate >= ALERT_THRESHOLDS.platform.apiErrorRate.warning
      ) {
        alerts.push(
          await createAlert({
            level: "platform",
            severity: "warning",
            type: "api_error_rate",
            title: "Warning: API Error Rate High",
            message: `API error rate is at ${metrics.api.errorRate}%, exceeding warning threshold of ${ALERT_THRESHOLDS.platform.apiErrorRate.warning}%`,
            triggerValue: metrics.api.errorRate,
            threshold: ALERT_THRESHOLDS.platform.apiErrorRate.warning,
          })
        );
      }
    }

    // Check database metrics
    if (metrics.database) {
      if (
        metrics.database.queryLatency?.p99 >=
        ALERT_THRESHOLDS.platform.dbQueryLatency.critical
      ) {
        alerts.push(
          await createAlert({
            level: "platform",
            severity: "critical",
            type: "db_slow",
            title: "Critical: Database Queries Extremely Slow",
            message: `Database p99 latency is ${metrics.database.queryLatency.p99}ms, exceeding critical threshold of ${ALERT_THRESHOLDS.platform.dbQueryLatency.critical}ms`,
            triggerValue: metrics.database.queryLatency.p99,
            threshold: ALERT_THRESHOLDS.platform.dbQueryLatency.critical,
          })
        );
      } else if (
        metrics.database.queryLatency?.p99 >=
        ALERT_THRESHOLDS.platform.dbQueryLatency.warning
      ) {
        alerts.push(
          await createAlert({
            level: "platform",
            severity: "warning",
            type: "db_slow",
            title: "Warning: Database Queries Slow",
            message: `Database p99 latency is ${metrics.database.queryLatency.p99}ms, exceeding warning threshold of ${ALERT_THRESHOLDS.platform.dbQueryLatency.warning}ms`,
            triggerValue: metrics.database.queryLatency.p99,
            threshold: ALERT_THRESHOLDS.platform.dbQueryLatency.warning,
          })
        );
      }
    }

    return alerts;
  } catch (error) {
    logger.error("Error checking metrics and creating alerts", {
      error: error.message,
    });
    return alerts;
  }
};

module.exports = {
  ALERT_THRESHOLDS,
  createAlert,
  acknowledgeAlert,
  resolveAlert,
  getActiveAlerts,
  getPlatformAlerts,
  getTenantAlerts,
  checkMetricsAndAlert,
  sendAlertNotifications,
};
