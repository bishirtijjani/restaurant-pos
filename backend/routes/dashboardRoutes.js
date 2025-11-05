const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");

// Route to fetch dashboard data
router.get("/", dashboardController.getDashboardStats);

module.exports = router;
