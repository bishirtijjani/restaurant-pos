const express = require("express");
const router = express.Router();
const {
  getOverviewData,
  getSalesData,
  getMenuData,
  getStaffData,
  getCustomerData,
  getInventoryData,
  getPaymentData,
  getAdvancedData,
} = require("../controllers/analyticsController");
const authMiddleware = require("../middleware/authMiddleware");

// All analytics routes are authMiddlewareed
router.use(authMiddleware);

router.get("/overview", getOverviewData);
router.get("/sales", getSalesData);
router.get("/menu", getMenuData);
router.get("/staff", getStaffData);
router.get("/customers", getCustomerData);
router.get("/inventory", getInventoryData);
router.get("/payments", getPaymentData);
router.get("/advanced", getAdvancedData);

module.exports = router;
