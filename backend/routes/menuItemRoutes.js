const express = require("express");
const router = express.Router();
const menuItemController = require("../controllers/menuItemController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, menuItemController.getAllMenuItems);
router.get("/:id", authMiddleware, menuItemController.getMenuItemById);
router.post("/", authMiddleware, menuItemController.addNewMenuItem);
router.put("/:id", authMiddleware, menuItemController.updateMenuItem);
router.delete("/:id", authMiddleware, menuItemController.deleteMenuItem);
router.patch(
  "/:id/toggle-availability",
  authMiddleware,
  menuItemController.toggleAvailability
);

module.exports = router;
