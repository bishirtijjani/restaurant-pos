const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

router.post("/", orderController.createOrder);
router.get("/", orderController.getAllOrders);
router.get("/:id", orderController.getOrderById);
router.put("/:id/status", orderController.updateOrderStatus);
router.put("/:id/payment", orderController.updatePayment);
router.delete("/:id", orderController.cancelOrder);

module.exports = router;
