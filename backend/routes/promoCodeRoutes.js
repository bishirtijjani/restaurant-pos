// backend/routes/promoCodeRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createPromoCode,
  getAllPromoCodes,
  getPromoCodeById,
  validateCode,
  updatePromoCode,
  deletePromoCode,
  togglePromoCodeStatus,
} = require("../controllers/promoCodeController");

// Apply auth middleware to all routes
router.use(authMiddleware);

// Validate promo code (for POS)
router.post("/validate", validateCode);

// CRUD routes
router.post("/", createPromoCode);
router.get("/", getAllPromoCodes);
router.get("/:id", getPromoCodeById);
router.put("/:id", updatePromoCode);
router.delete("/:id", deletePromoCode);
router.patch("/:id/toggle", togglePromoCodeStatus);

module.exports = router;
