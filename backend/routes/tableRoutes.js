const express = require("express");
const router = express.Router();
const {
  getAllTables,
  getTableById,
  createTable,
  updateTable,
  deleteTable,
  updateTableStatus,
  assignStaff,
  linkOrder,
  unlinkOrder,
  mergeTables,
  splitTable,
} = require("../controllers/tableController");
const { protect } = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/roleMiddleware");

router
  .route("/")
  .get(protect, checkPermission("tables", "read"), getAllTables)
  .post(protect, checkPermission("tables", "create"), createTable);

router
  .route("/:id")
  .get(protect, checkPermission("tables", "read"), getTableById)
  .put(protect, checkPermission("tables", "update"), updateTable)
  .delete(protect, checkPermission("tables", "delete"), deleteTable);

router
  .route("/:id/status")
  .patch(protect, checkPermission("tables", "update"), updateTableStatus);

router
  .route("/:id/assign")
  .patch(protect, checkPermission("tables", "update"), assignStaff);

router
  .route("/:id/link-order")
  .patch(protect, checkPermission("orders", "update"), linkOrder);

router
  .route("/:id/unlink-order")
  .patch(protect, checkPermission("orders", "update"), unlinkOrder);

router
  .route("/merge")
  .post(protect, checkPermission("tables", "update"), mergeTables);
router
  .route("/:id/split")
  .post(protect, checkPermission("tables", "update"), splitTable);

module.exports = router;
