const express = require("express");
const router = express.Router();

router.use("/general-settings", require("./generalSettingsRoutes"));
router.use("/auth", require("./authRoutes"));
router.use("/users", require("./userRoutes"));
router.use("/customers", require("./customerRoutes"));
router.use("/categories", require("./categoryRoutes"));
router.use("/dashboard", require("./dashboardRoutes"));
router.use("/menu-items", require("./menuItemRoutes"));
router.use("/suppliers", require("./supplierRoutes"));
router.use("/orders", require("./orderRoutes"));
router.use("/analytics", require("./analyticsRoutes"));
router.use("/expenses", require("./expenseRoutes"));
router.use("/kds", require("./kdsRoutes"));
router.use("/onboarding", require("./onboardingRoutes"));

module.exports = router;
