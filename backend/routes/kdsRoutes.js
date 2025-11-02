// backend/routes/kdsRoutes.js
const express = require("express");
const router = express.Router();
const kdsController = require("../controllers/kdsController");
const authMiddleware = require("../middleware/authMiddleware");

// Order routes
router.get("/orders/:stationId", authMiddleware, kdsController.getKDSOrders);
router.patch(
  "/orders/:orderId/item-status",
  authMiddleware,
  kdsController.updateOrderItemStatus
);
router.post("/orders/:orderId/bump", authMiddleware, kdsController.bumpOrder);
router.post(
  "/orders/:orderId/recall",
  authMiddleware,
  kdsController.recallOrder
);

// Station routes
router.get("/stations", authMiddleware, kdsController.getAllStations);
router.post("/stations", authMiddleware, kdsController.createStation);
router.put("/stations/:id", authMiddleware, kdsController.updateStation);

module.exports = router;
