const express = require("express");
const router = express.Router();
const stockAdjustmentController = require("../controllers/stockAdjustmentController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Apply auth middleware to all routes
router.use(authMiddleware);

router.get(
  "/",
  roleMiddleware("admin", "manager", "kitchen"),
  stockAdjustmentController.getAllStockAdjustments
);
router.get(
  "/:id",
  roleMiddleware("admin", "manager", "kitchen"),
  stockAdjustmentController.getStockAdjustmentById
);
router.post(
  "/",
  roleMiddleware("admin", "manager"),
  stockAdjustmentController.createStockAdjustment
);
router.get(
  "/item/:itemId",
  roleMiddleware("admin", "manager", "kitchen"),
  stockAdjustmentController.getAdjustmentsByItem
);

module.exports = router;
