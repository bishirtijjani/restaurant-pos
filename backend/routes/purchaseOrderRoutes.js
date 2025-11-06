const express = require("express");
const router = express.Router();
const purchaseOrderController = require("../controllers/purchaseOrderController");

router.get("/", purchaseOrderController.getAllPurchaseOrders);
router.get("/:id", purchaseOrderController.getPurchaseOrderById);
router.post("/", purchaseOrderController.createPurchaseOrder);
router.put("/:id", purchaseOrderController.updatePurchaseOrder);
router.patch("/:id/approve", purchaseOrderController.approvePurchaseOrder);
router.patch("/:id/receive", purchaseOrderController.receivePurchaseOrder);
router.patch("/:id/cancel", purchaseOrderController.cancelPurchaseOrder);
router.patch("/:id/payment", purchaseOrderController.updatePaymentStatus);

module.exports = router;
