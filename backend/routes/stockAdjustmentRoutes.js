const express = require("express");
const router = express.Router();
const stockAdjustmentController = require("../controllers/stockAdjustmentController");

router.get("/", stockAdjustmentController.getAllStockAdjustments);
router.get("/:id", stockAdjustmentController.getStockAdjustmentById);
router.post("/", stockAdjustmentController.createStockAdjustment);
router.get("/item/:itemId", stockAdjustmentController.getAdjustmentsByItem);

module.exports = router;
