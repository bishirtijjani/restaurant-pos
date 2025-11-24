const express = require("express");
const router = express.Router();
const {
  getAllReservations,
  getReservationById,
  createReservation,
  updateReservation,
  deleteReservation,
  updateReservationStatus,
  getAvailableTables,
} = require("../controllers/reservationController");
const { protect } = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/roleMiddleware");

router
  .route("/available-tables")
  .get(protect, checkPermission("reservations", "read"), getAvailableTables);

router
  .route("/")
  .get(protect, checkPermission("reservations", "read"), getAllReservations)
  .post(protect, checkPermission("reservations", "create"), createReservation);

router
  .route("/:id")
  .get(protect, checkPermission("reservations", "read"), getReservationById)
  .put(protect, checkPermission("reservations", "update"), updateReservation)
  .delete(protect, checkPermission("reservations", "delete"), deleteReservation);

router
  .route("/:id/status")
  .patch(
    protect,
    checkPermission("reservations", "update"),
    updateReservationStatus
  );

module.exports = router;
