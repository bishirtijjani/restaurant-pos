const express = require("express");
const router = express.Router();
const {
  getSettings,
  updateSettings,
  resetSettings,
  getCurrencies,
} = require("../controllers/generalSettingsController");

router.get("/", getSettings);
router.put("/", updateSettings);
router.post("/reset", resetSettings);

module.exports = router;
