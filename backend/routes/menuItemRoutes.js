const express = require("express");
const router = express.Router();
const menuItemController = require("../controllers/menuItemController");

router.get("/", menuItemController.getAllMenuItems);
router.get("/:id", menuItemController.getMenuItemById);
router.post("/", menuItemController.addNewMenuItem);
router.put("/:id", menuItemController.updateMenuItem);
router.delete("/:id", menuItemController.deleteMenuItem);
router.patch("/:id/toggle-availability", menuItemController.toggleAvailability);

module.exports = router;
