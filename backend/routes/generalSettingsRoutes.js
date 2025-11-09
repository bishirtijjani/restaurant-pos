const express = require("express");
const router = express.Router();
const {
  getSettings,
  updateSettings,
  resetSettings,
} = require("../controllers/generalSettingsController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Apply auth middleware to all routes
router.use(authMiddleware);

router.get("/", getSettings);
router.put("/", roleMiddleware("admin"), updateSettings);
router.post("/reset", roleMiddleware("admin"), resetSettings);

module.exports = router;
