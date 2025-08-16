const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, orderController.createOrder);
router.get("/", authMiddleware, orderController.getAllOrders);
router.get("/:id", authMiddleware, orderController.getOrderById);
router.put("/:id/status", authMiddleware, orderController.updateOrderStatus);
router.put("/:id/payment", authMiddleware, orderController.updatePayment);
router.delete("/:id", authMiddleware, orderController.cancelOrder);

module.exports = router;
