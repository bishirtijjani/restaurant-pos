const express = require("express");
const router = express.Router();
const kdsController = require("../controllers/kdsController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Apply auth and role middleware to all KDS routes
router.use(authMiddleware, roleMiddleware("admin", "manager", "kitchen"));

// Order routes
router.get("/orders/:stationId", kdsController.getKDSOrders);
router.patch("/orders/:orderId/status", kdsController.updateKDSOrderStatus);
router.post("/orders/:orderId/recall", kdsController.recallOrder);

module.exports = router;
