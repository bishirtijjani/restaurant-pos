const express = require("express");
const router = express.Router();
const {
  getBrandMenu,
  createMasterItem,
  updateMasterItem,
  publishMasterItem,
  getSyncStatus,
  deleteMasterItem,
} = require("../controllers/brandMenuController");
const { protect } = require("../middleware/authMiddleware");
const { requirePermission } = require("../middleware/permissionMiddleware");
const { PERMISSIONS } = require("../config/permissions");

// All routes require authentication
router.use(protect);
const organizationMiddleware = require("../middleware/organizationMiddleware");
router.use(organizationMiddleware);

// Brand Menu CRUD
router.get(
  "/menu",
  requirePermission(PERMISSIONS.BRAND_MENU_VIEW),
  getBrandMenu
);

router.post(
  "/menu",
  requirePermission(PERMISSIONS.BRAND_MENU_EDIT),
  createMasterItem
);

router.put(
  "/menu/:id",
  requirePermission(PERMISSIONS.BRAND_MENU_EDIT),
  updateMasterItem
);

router.delete(
  "/menu/:id",
  requirePermission(PERMISSIONS.BRAND_MENU_EDIT),
  deleteMasterItem
);

// Publish workflow
router.post(
  "/menu/:id/publish",
  requirePermission(PERMISSIONS.BRAND_MENU_PUBLISH),
  publishMasterItem
);

// Sync status
router.get("/sync/:jobId", getSyncStatus);

module.exports = router;
