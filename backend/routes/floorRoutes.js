const express = require("express");
const router = express.Router();
const {
  getAllFloors,
  getFloorById,
  createFloor,
  updateFloor,
  deleteFloor,
  reorderFloors,
} = require("../controllers/floorController");
const { protect, admin } = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/roleMiddleware");

// Route for reordering floors
router
  .route("/reorder")
  .patch(protect, checkPermission("floors", "update"), reorderFloors);

// Standard routes
router
  .route("/")
  .get(protect, checkPermission("floors", "read"), getAllFloors)
  .post(protect, checkPermission("floors", "create"), createFloor);

router
  .route("/:id")
  .get(protect, checkPermission("floors", "read"), getFloorById)
  .put(protect, checkPermission("floors", "update"), updateFloor)
  .delete(protect, checkPermission("floors", "delete"), deleteFloor);

module.exports = router;
