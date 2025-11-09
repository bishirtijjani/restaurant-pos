const express = require("express");
const router = express.Router();
const menuItemController = require("../controllers/menuItemController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Apply auth middleware to all routes
router.use(authMiddleware);

router.get(
  "/",
  roleMiddleware("admin", "manager", "staff"),
  menuItemController.getAllMenuItems
);
router.get(
  "/:id",
  roleMiddleware("admin", "manager", "staff"),
  menuItemController.getMenuItemById
);
router.post(
  "/",
  roleMiddleware("admin", "manager"),
  menuItemController.addNewMenuItem
);
router.put(
  "/:id",
  roleMiddleware("admin", "manager"),
  menuItemController.updateMenuItem
);
router.delete(
  "/:id",
  roleMiddleware("admin"),
  menuItemController.deleteMenuItem
);
router.patch(
  "/:id/toggle-availability",
  roleMiddleware("admin", "manager", "staff"),
  menuItemController.toggleAvailability
);

module.exports = router;
