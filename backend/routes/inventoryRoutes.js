const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");

// Inventory item routes
router.get("/", inventoryController.getAllInventoryItems);
router.get("/low-stock", inventoryController.getLowStockItems);
router.get("/:id", inventoryController.getInventoryItemById);
router.post("/", inventoryController.createInventoryItem);
router.put("/:id", inventoryController.updateInventoryItem);
router.delete("/:id", inventoryController.deleteInventoryItem);

// Menu item linking routes
router.post("/:id/link-menu-item", inventoryController.linkToMenuItem);
router.delete(
  "/:id/unlink-menu-item/:menuItemId",
  inventoryController.unlinkMenuItem
);

module.exports = router;
