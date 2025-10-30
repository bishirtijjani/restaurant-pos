const express = require("express");
const router = express.Router();
const {
  getSettings,
  updateSettings,
  resetSettings,
  getCurrencies,
} = require("../controllers/generalSettingsController");

const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, getSettings);
router.put("/", authMiddleware, updateSettings);
router.post("/reset", authMiddleware, resetSettings);

module.exports = router;
