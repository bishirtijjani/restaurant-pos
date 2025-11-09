const express = require("express");
const router = express.Router();
const purchaseOrderController = require("../controllers/purchaseOrderController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Apply auth middleware to all routes
router.use(authMiddleware);

router.get(
  "/",
  roleMiddleware("admin", "manager", "accountant"),
  purchaseOrderController.getAllPurchaseOrders
);
router.get(
  "/:id",
  roleMiddleware("admin", "manager", "accountant"),
  purchaseOrderController.getPurchaseOrderById
);
router.post(
  "/",
  roleMiddleware("admin", "manager"),
  purchaseOrderController.createPurchaseOrder
);
router.put(
  "/:id",
  roleMiddleware("admin", "manager"),
  purchaseOrderController.updatePurchaseOrder
);
router.patch(
  "/:id/approve",
  roleMiddleware("admin", "manager"),
  purchaseOrderController.approvePurchaseOrder
);
router.patch(
  "/:id/receive",
  roleMiddleware("admin", "manager"),
  purchaseOrderController.receivePurchaseOrder
);
router.patch(
  "/:id/cancel",
  roleMiddleware("admin", "manager"),
  purchaseOrderController.cancelPurchaseOrder
);
router.patch(
  "/:id/payment",
  roleMiddleware("admin", "manager"),
  purchaseOrderController.updatePaymentStatus
);

module.exports = router;
