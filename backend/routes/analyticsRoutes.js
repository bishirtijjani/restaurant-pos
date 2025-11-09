const express = require("express");
const analyticsController = require("../controllers/analyticsController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// All analytics routes are protected and restricted to specific roles
router.use(
  authMiddleware,
  roleMiddleware("admin", "manager", "accountant")
);

// Analytics routes
router.get("/overview", analyticsController.getOverviewStats);
router.get("/sales-trends", analyticsController.getSalesTrends);
router.get("/sales-by-category", analyticsController.getSalesByCategory);
router.get(
  "/menu-item-performance",
  analyticsController.getMenuItemPerformance
);
router.get("/peak-hours", analyticsController.getPeakHoursAnalysis);
router.get("/expense-analysis", analyticsController.getExpenseAnalysis);
router.get("/staff-performance", analyticsController.getStaffPerformance);
router.get("/profitability", analyticsController.getProfitabilityReport);

// Export route
router.get("/export", analyticsController.exportAnalyticsData);

module.exports = router;
