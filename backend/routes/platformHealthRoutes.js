// backend/routes/platformHealthRoutes.js
// Platform-level health monitoring routes (super-admin only)

const express = require("express");
const router = express.Router();
const {
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
} = require("../controllers/healthController");
const requireAuth = require("../middleware/authMiddleware");

// Middleware to check for super-admin role
// TODO: Implement proper super-admin check based on your user model
const requireSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Super-admin privileges required.",
    });
  }
  next();
};

// Public health check endpoints (for load balancers, monitoring tools)
router.get("/health", getBasicHealth);
router.get("/health/ready", getReadinessCheck);

// Protected platform health endpoints
router.get(
  "/health/detailed",
  requireAuth,
  requireSuperAdmin,
  getDetailedHealth
);

// Metrics endpoints
router.get("/metrics/system", requireAuth, requireSuperAdmin, getSystemMetrics);
router.get(
  "/metrics/database",
  requireAuth,
  requireSuperAdmin,
  getDatabaseMetrics
);
router.get("/metrics/api", requireAuth, requireSuperAdmin, getAPIMetrics);
router.get(
  "/metrics/tenants",
  requireAuth,
  requireSuperAdmin,
  getTenantMetrics
);

// Alert endpoints
router.get("/alerts", requireAuth, requireSuperAdmin, getPlatformAlerts);
router.post(
  "/alerts/:id/acknowledge",
  requireAuth,
  requireSuperAdmin,
  acknowledgePlatformAlert
);
router.post(
  "/alerts/:id/resolve",
  requireAuth,
  requireSuperAdmin,
  resolvePlatformAlert
);

module.exports = router;
