// backend/routes/reservationRoutes.js
const express = require("express");
const router = express.Router();
const reservationController = require("../controllers/reservationController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.use(authMiddleware);

router.get(
  "/",
  roleMiddleware("admin", "manager", "cashier", "waiter"),
  reservationController.getAllReservations
);

router.get(
  "/:id",
  roleMiddleware("admin", "manager", "cashier", "waiter"),
  reservationController.getReservationById
);

router.post(
  "/",
  roleMiddleware("admin", "manager", "cashier", "waiter"),
  reservationController.createReservation
);

router.put(
  "/:id",
  roleMiddleware("admin", "manager", "cashier", "waiter"),
  reservationController.updateReservation
);

router.patch(
  "/:id/status",
  roleMiddleware("admin", "manager", "cashier", "waiter"),
  reservationController.updateReservationStatus
);

router.delete(
  "/:id",
  roleMiddleware("admin", "manager"),
  reservationController.deleteReservation
);

module.exports = router;
