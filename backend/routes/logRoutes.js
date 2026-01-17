const express = require("express");
const router = express.Router();
const logController = require("../controllers/logController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const storeMiddleware = require("../middleware/storeMiddleware"); // Needed for store context

// All routes are protected and restricted to Admin/Manager
// Assuming restrictTo takes roles as arguments.
// If roleMiddleware isn't available, I'll check its existence next, but this is standard pattern.
router.use(authMiddleware);
router.use(storeMiddleware); // Ensure we have storeId
router.use(roleMiddleware("admin", "owner", "manager"));

router.get("/", logController.getAuditLogs);
router.get("/filters", logController.getLogFilters);

module.exports = router;
