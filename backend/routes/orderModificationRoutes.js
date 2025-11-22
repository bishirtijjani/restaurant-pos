// backend/routes/orderModificationRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const orderModificationController = require("../controllers/orderModificationController");

router.use(authMiddleware);

router.put("/:orderId", orderModificationController.modifyOrder);
router.post("/:orderId/items", orderModificationController.addItemsToOrder);
router.delete(
  "/:orderId/items",
  orderModificationController.removeItemsFromOrder
);
router.patch(
  "/:orderId/items/:itemId/quantity",
  orderModificationController.updateItemQuantity
);
router.patch(
  "/:orderId/items/:itemId/note",
  orderModificationController.updateItemNote
);
router.patch("/:orderId/note", orderModificationController.updateOrderNote);
router.get(
  "/:orderId/history",
  orderModificationController.getOrderModificationHistory
);

module.exports = router;
