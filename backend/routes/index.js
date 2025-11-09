const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// does not need authMiddleware
router.use("/auth", require("./authRoutes"));

const adminMiddleware = require("../middleware/adminMiddleware");

// all subsequent routes need authMiddleware
router.use(authMiddleware);

router.use("/users", require("./userRoutes"));
router.use("/general-settings", require("./generalSettingsRoutes"));
router.use("/customers", require("./customerRoutes"));
router.use("/categories", require("./categoryRoutes"));
router.use("/dashboard", require("./dashboardRoutes"));
router.use("/menu-items", require("./menuItemRoutes"));
router.use("/suppliers", require("./supplierRoutes"));
router.use("/orders", require("./orderRoutes"));
router.use("/analytics", require("./analyticsRoutes"));
router.use("/expenses", require("./expenseRoutes"));
router.use("/kds", require("./kdsRoutes"));
router.use("/stations", require("./kdsStationRoutes"));
router.use("/onboarding", require("./onboardingRoutes"));
router.use("/inventory", require("./inventoryRoutes"));
router.use("/purchase-orders", require("./purchaseOrderRoutes"));
router.use("/stock-adjustments", require("./stockAdjustmentRoutes"));

module.exports = router;
