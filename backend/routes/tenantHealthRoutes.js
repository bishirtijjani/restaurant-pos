// backend/routes/tenantHealthRoutes.js
// Tenant-level health monitoring routes

const express = require("express");
const router = express.Router();
const {
  getTenantHealth,
  getTenantDevices,
  sendDeviceHeartbeat,
  getTenantAlerts,
  acknowledgeTenantAlert,
} = require("../controllers/healthController");
const requireAuth = require("../middleware/authMiddleware");

// Middleware to check for admin role
const requireAdmin = (req, res, next) => {
  if (!req.user || !["admin", "manager"].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    });
  }
  next();
};

// Tenant health overview
router.get("/tenant", requireAuth, requireAdmin, getTenantHealth);

// Device management
router.get("/tenant/devices", requireAuth, requireAdmin, getTenantDevices);
router.post("/tenant/devices/heartbeat", requireAuth, sendDeviceHeartbeat);

// Tenant alerts
router.get("/tenant/alerts", requireAuth, requireAdmin, getTenantAlerts);
router.post(
  "/tenant/alerts/:id/acknowledge",
  requireAuth,
  requireAdmin,
  acknowledgeTenantAlert
);

module.exports = router;
