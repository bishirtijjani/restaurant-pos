const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const permissionMiddleware = require("../middleware/permissionMiddleware");
const { PERMISSIONS } = require("../config/permissions");

// Apply auth middleware to all routes
router.use(authMiddleware);

router.post(
  "/",
  roleMiddleware("admin", "manager", "cashier", "waiter"),
  orderController.createOrder,
);
router.get(
  "/",
  roleMiddleware("admin", "manager", "cashier", "waiter"),
  orderController.getAllOrders,
);
router.get(
  "/:id",
  roleMiddleware("admin", "manager", "cashier", "waiter"),
  orderController.getOrderById,
);
router.put(
  "/:id/status",
  roleMiddleware("admin", "manager", "cashier", "waiter"),
  orderController.updateOrderStatus,
);
router.put(
  "/:id/payment",
  roleMiddleware("admin", "manager", "cashier", "waiter"),
  orderController.updatePayment,
);
router.delete(
  "/:id",
  roleMiddleware("admin", "manager"),
  orderController.cancelOrder,
);
router.post(
  "/:id/refund",
  roleMiddleware("admin", "manager"),
  orderController.refundOrder,
);
router.patch(
  "/:id/reopen",
  permissionMiddleware(PERMISSIONS.ORDERS_REOPEN),
  orderController.reopenOrder,
);

// Order Modifications (Modifying items in existing orders)
const orderModificationController = require("../controllers/orderModificationController");

router.put(
  "/:orderId/items",
  roleMiddleware("admin", "manager", "cashier", "waiter"),
  orderModificationController.modifyOrder,
);
router.post(
  "/:orderId/items",
  roleMiddleware("admin", "manager", "cashier", "waiter"),
  orderModificationController.addItemsToOrder,
);
router.delete(
  "/:orderId/items",
  roleMiddleware("admin", "manager", "cashier", "waiter"),
  orderModificationController.removeItemsFromOrder,
);
router.patch(
  "/:orderId/items/:itemId/quantity",
  roleMiddleware("admin", "manager", "cashier", "waiter"),
  orderModificationController.updateItemQuantity,
);
router.patch(
  "/:orderId/items/:itemId/note",
  roleMiddleware("admin", "manager", "cashier", "waiter"),
  orderModificationController.updateItemNote,
);
router.patch(
  "/:orderId/note",
  roleMiddleware("admin", "manager", "cashier", "waiter"),
  orderModificationController.updateOrderNote,
);
router.get(
  "/:orderId/history",
  roleMiddleware("admin", "manager", "cashier", "waiter"),
  orderModificationController.getOrderModificationHistory,
);

// Split & Merge
router.post(
  "/:orderId/split",
  roleMiddleware("admin", "manager", "cashier", "waiter"),
  orderModificationController.splitOrder,
);
router.post(
  "/merge",
  roleMiddleware("admin", "manager", "cashier", "waiter"),
  orderModificationController.mergeOrders,
);

module.exports = router;
