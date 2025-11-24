const express = require("express");
const router = express.Router();
const floorController = require("../controllers/floorController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.use(authMiddleware);

router.get(
  "/",
  roleMiddleware("admin", "manager", "cashier", "waiter"),
  floorController.getAllFloors
);

router.get(
  "/:id",
  roleMiddleware("admin", "manager", "cashier", "waiter"),
  floorController.getFloorById
);

router.post(
  "/",
  roleMiddleware("admin", "manager"),
  floorController.createFloor
);

router.put(
  "/:id",
  roleMiddleware("admin", "manager"),
  floorController.updateFloor
);

router.delete(
  "/:id",
  roleMiddleware("admin", "manager"),
  floorController.deleteFloor
);

module.exports = router;
