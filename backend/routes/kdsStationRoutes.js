const express = require("express");
const router = express.Router();
const kdsStationsController = require("../controllers/kdsStationsController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Apply auth middleware to all routes
router.use(authMiddleware);

// Station routes
router.get(
  "/",
  roleMiddleware("admin", "manager", "kitchen"),
  kdsStationsController.getAllStations
);
router.post(
  "/",
  roleMiddleware("admin", "manager"),
  kdsStationsController.createStation
);
router.put(
  "/:id",
  roleMiddleware("admin", "manager"),
  kdsStationsController.updateStation
);
router.delete(
  "/:id",
  roleMiddleware("admin", "manager"),
  kdsStationsController.deleteStation
);
module.exports = router;
