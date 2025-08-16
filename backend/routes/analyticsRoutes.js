const express = require("express");
const analyticsController = require("../controllers/analyticsController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Analytics routes
router.get("/overview", authMiddleware, analyticsController.getOverviewStats);
router.get("/sales-trends", authMiddleware, analyticsController.getSalesTrends);
router.get(
  "/sales-by-category",
  authMiddleware,
  analyticsController.getSalesByCategory
);
router.get(
  "/menu-item-performance",
  authMiddleware,
  analyticsController.getMenuItemPerformance
);
router.get(
  "/peak-hours",
  authMiddleware,
  analyticsController.getPeakHoursAnalysis
);
router.get(
  "/expense-analysis",
  authMiddleware,
  analyticsController.getExpenseAnalysis
);
router.get(
  "/staff-performance",
  authMiddleware,
  analyticsController.getStaffPerformance
);
router.get(
  "/profitability",
  authMiddleware,
  analyticsController.getProfitabilityReport
);

// Export route
router.get("/export", authMiddleware, analyticsController.exportAnalyticsData);

module.exports = router;
