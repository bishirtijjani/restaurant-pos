// backend/routes/tableRoutes.js
const express = require("express");
const router = express.Router();
const tableController = require("../controllers/tableController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.use(authMiddleware);

router.get(
  "/",
  roleMiddleware("admin", "manager", "cashier", "waiter"),
  tableController.getAllTables
);

router.get(
  "/:id",
  roleMiddleware("admin", "manager", "cashier", "waiter"),
  tableController.getTableById
);

router.get(
  "/:id/qr",
  roleMiddleware("admin", "manager"),
  tableController.generateTableQR
);

router.get(
  "/:id/timeline",
  roleMiddleware("admin", "manager"),
  tableController.getTableTimeline
);

router.post(
  "/",
  roleMiddleware("admin", "manager"),
  tableController.createTable
);

router.put(
  "/:id",
  roleMiddleware("admin", "manager"),
  tableController.updateTable
);

router.put(
  "/:id/status",
  roleMiddleware("admin", "manager", "cashier", "waiter"),
  tableController.updateTableStatus
);

router.put(
  "/:id/position",
  roleMiddleware("admin", "manager"),
  tableController.updateTablePosition
);

router.put(
  "/:id/link-order",
  roleMiddleware("admin", "manager", "cashier", "waiter"),
  tableController.linkTableToOrder
);

router.put(
  "/:id/unlink-order",
  roleMiddleware("admin", "manager", "cashier", "waiter"),
  tableController.unlinkTableFromOrder
);

router.post(
  "/merge",
  roleMiddleware("admin", "manager"),
  tableController.mergeTables
);

router.put(
  "/:id/split",
  roleMiddleware("admin", "manager"),
  tableController.splitTables
);

router.delete(
  "/:id",
  roleMiddleware("admin", "manager"),
  tableController.deleteTable
);

module.exports = router;
