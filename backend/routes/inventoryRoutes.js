const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Apply auth middleware to all routes
router.use(authMiddleware);

// Inventory item routes
router.get(
  "/",
  roleMiddleware("admin", "manager", "kitchen"),
  inventoryController.getAllInventoryItems
);
router.get(
  "/low-stock",
  roleMiddleware("admin", "manager", "kitchen"),
  inventoryController.getLowStockItems
);
router.get(
  "/:id",
  roleMiddleware("admin", "manager", "kitchen"),
  inventoryController.getInventoryItemById
);
router.post(
  "/",
  roleMiddleware("admin", "manager"),
  inventoryController.createInventoryItem
);
router.put(
  "/:id",
  roleMiddleware("admin", "manager"),
  inventoryController.updateInventoryItem
);
router.delete(
  "/:id",
  roleMiddleware("admin"),
  inventoryController.deleteInventoryItem
);

// Menu item linking routes
router.post(
  "/:id/link-menu-item",
  roleMiddleware("admin", "manager"),
  inventoryController.linkToMenuItem
);
router.delete(
  "/:id/unlink-menu-item/:menuItemId",
  roleMiddleware("admin", "manager"),
  inventoryController.unlinkMenuItem
);

module.exports = router;
