const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { isSuperAdmin } = require("../middleware/superAdminMiddleware");
const {
  getAllOrganizations,
  updateOrganizationStatus,
  updateOrganizationPlan,
} = require("../controllers/platformAdminController");

// Protect all routes with auth + super admin checks
router.use(authMiddleware, isSuperAdmin);

router.get("/organizations", getAllOrganizations);
router.patch("/organizations/:id/status", updateOrganizationStatus);
router.patch("/organizations/:id/plan", updateOrganizationPlan);

module.exports = router;
