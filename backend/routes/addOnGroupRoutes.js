// backend/routes/addOnGroupRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const addOnGroupController = require("../controllers/addOnGroupController");

router.use(authMiddleware);

router.get("/", addOnGroupController.getAllAddOnGroups);
router.get("/:id", addOnGroupController.getAddOnGroupById);
router.get(
  "/menu-item/:menuItemId",
  addOnGroupController.getAddOnGroupsForMenuItem
);
router.post("/", addOnGroupController.createAddOnGroup);
router.put("/:id", addOnGroupController.updateAddOnGroup);
router.delete("/:id", addOnGroupController.deleteAddOnGroup);

module.exports = router;
