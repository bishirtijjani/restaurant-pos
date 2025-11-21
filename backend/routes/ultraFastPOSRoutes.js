// backend/routes/ultraFastPOSRoutes.js
const express = require("express");
const router = express.Router();
const ultraFastPOSController = require("../controllers/ultraFastPOSController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.get("/keyboard-settings", ultraFastPOSController.getKeyboardSettings);
router.put("/keyboard-settings", ultraFastPOSController.updateKeyboardSettings);
router.post(
  "/keyboard-settings/reset",
  ultraFastPOSController.resetKeyboardSettings
);

module.exports = router;
