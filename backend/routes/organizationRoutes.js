const express = require("express");
const router = express.Router();
const {
  getOrganization,
  updateOrganization,
} = require("../controllers/organizationController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.get("/:id", getOrganization);
router.put("/:id", updateOrganization);

module.exports = router;
