const express = require("express");
const router = express.Router();

// Public Routes
router.use("/auth", require("./authRoutes"));

// Webhook routes (must be before JSON parser middleware)
router.use("/webhooks", require("./webhookRoutes"));

// Global Middleware for Protected Routes
const authMiddleware = require("../middleware/authMiddleware");
const storeMiddleware = require("../middleware/storeMiddleware");

router.use(authMiddleware);

// Global Analytics (Brand-wide) - Bypasses Store Context requirement
const { getMultiStoreOverview } = require("../controllers/analyticsController");
router.get("/analytics/multi-store-overview", getMultiStoreOverview);

// Brand-Level Routes (Organization-wide, no store context required)
router.use("/brand", require("./brandRoutes"));

router.use(storeMiddleware);

router.use("/users", require("./userRoutes"));
router.use("/general-settings", require("./generalSettingsRoutes"));
router.use("/customers", require("./customerRoutes"));
router.use("/categories", require("./categoryRoutes"));
router.use("/dashboard", require("./dashboardRoutes"));
router.use("/menu-items", require("./menuItemRoutes"));
router.use("/suppliers", require("./supplierRoutes"));
router.use("/orders", require("./orderRoutes"));
router.use("/order-modifications", require("./orderModificationRoutes"));
router.use("/void", require("./voidRoutes"));
router.use("/add-on-groups", require("./addOnGroupRoutes"));
router.use("/expenses", require("./expenseRoutes"));
router.use("/kds", require("./kdsRoutes"));
router.use("/stations", require("./kdsStationRoutes"));
router.use("/onboarding", require("./onboardingRoutes"));
router.use("/inventory", require("./inventoryRoutes"));
router.use("/purchase-orders", require("./purchaseOrderRoutes"));
router.use("/stock-adjustments", require("./stockAdjustmentRoutes"));
router.use("/ultra-fast-pos", require("./ultraFastPOSRoutes"));
router.use("/discounts", require("./discountRoutes"));
router.use("/promo-codes", require("./promoCodeRoutes"));
router.use("/floors", require("./floorRoutes"));
router.use("/tables", require("./tableRoutes"));
router.use("/reservations", require("./reservationRoutes"));
router.use("/analytics", require("./analyticsRoutes"));
router.use("/reports", require("./reportRoutes"));
router.use("/import", require("./importExportRoutes"));
router.use("/stores", require("./storeRoutes"));
router.use("/organizations", require("./organizationRoutes"));
router.use("/payments", require("./paymentRoutes"));
router.use("/sync", require("./syncRoutes"));

module.exports = router;
