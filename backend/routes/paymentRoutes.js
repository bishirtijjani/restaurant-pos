const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const protect = require("../middleware/authMiddleware");
const checkStore = require("../middleware/storeMiddleware");

router.get("/config", protect, checkStore, paymentController.getPaymentConfig);
router.post(
  "/create-intent",
  protect,
  checkStore,
  paymentController.createPaymentIntent
);

module.exports = router;
