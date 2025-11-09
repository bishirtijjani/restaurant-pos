const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Route to fetch dashboard data
router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin", "manager"),
  dashboardController.getDashboardStats
);

module.exports = router;
