const express = require("express");
const router = express.Router();
const kdsController = require("../controllers/kdsController");

// Order routes
router.get("/orders/:stationId", kdsController.getKDSOrders);
router.patch("/orders/:orderId/status", kdsController.updateKDSOrderStatus);
router.post("/orders/:orderId/recall", kdsController.recallOrder);

module.exports = router;
