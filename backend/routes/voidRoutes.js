// backend/routes/voidRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const voidController = require("../controllers/voidController");

router.use(authMiddleware);

router.post("/order/:orderId/items", voidController.voidOrderItems);
router.get("/order/:orderId", voidController.getVoidLogsForOrder);
router.get("/", voidController.getAllVoidLogs);

module.exports = router;
