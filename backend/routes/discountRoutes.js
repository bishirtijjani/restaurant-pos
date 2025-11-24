// backend/routes/discountRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createDiscount,
  getAllDiscounts,
  getDiscountById,
  updateDiscount,
  deleteDiscount,
  getActiveDiscountsForPOS,
  toggleDiscountStatus,
} = require("../controllers/discountController");

// Apply auth middleware to all routes
router.use(authMiddleware);

// POS-specific route (must be before :id route)
router.get("/active", getActiveDiscountsForPOS);

// CRUD routes
router.post("/", createDiscount);
router.get("/", getAllDiscounts);
router.get("/:id", getDiscountById);
router.put("/:id", updateDiscount);
router.delete("/:id", deleteDiscount);
router.patch("/:id/toggle", toggleDiscountStatus);

module.exports = router;
