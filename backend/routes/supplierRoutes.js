const express = require("express");
const {
  createSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
} = require("../controllers/supplierController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

router.post(
  "/",
  roleMiddleware("admin", "manager"),
  createSupplier
);
router.get(
  "/",
  roleMiddleware("admin", "manager", "staff"),
  getAllSuppliers
);
router.get(
  "/:id",
  roleMiddleware("admin", "manager", "staff"),
  getSupplierById
);
router.put(
  "/:id",
  roleMiddleware("admin", "manager"),
  updateSupplier
);
router.delete("/:id", roleMiddleware("admin"), deleteSupplier);

module.exports = router;
