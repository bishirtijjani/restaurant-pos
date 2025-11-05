const express = require("express");
const router = express.Router();
const kdsStationsController = require("../controllers/kdsStationsController");

// Station routes
router.get("/", kdsStationsController.getAllStations);
router.post("/", kdsStationsController.createStation);
router.put("/:id", kdsStationsController.updateStation);
router.delete("/:id", kdsStationsController.deleteStation);
module.exports = router;
