const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Apply auth middleware to all routes
router.use(authMiddleware);

router.post(
  "/",
  roleMiddleware("admin", "manager", "cashier", "waiter"),
  orderController.createOrder
);
router.get(
  "/",
  roleMiddleware("admin", "manager", "cashier", "waiter"),
  orderController.getAllOrders
);
router.get(
  "/:id",
  roleMiddleware("admin", "manager", "cashier", "waiter"),
  orderController.getOrderById
);
router.put(
  "/:id/status",
  roleMiddleware("admin", "manager", "cashier", "waiter"),
  orderController.updateOrderStatus
);
router.put(
  "/:id/payment",
  roleMiddleware("admin", "manager", "cashier", "waiter"),
  orderController.updatePayment
);
router.delete(
  "/:id",
  roleMiddleware("admin", "manager"),
  orderController.cancelOrder
);
router.post(
  "/:id/refund",
  roleMiddleware("admin", "manager"),
  orderController.refundOrder
);

module.exports = router;
