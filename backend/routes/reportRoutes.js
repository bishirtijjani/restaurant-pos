const express = require("express");
const router = express.Router();
const {
  getReports,
  createReport,
  deleteReport,
} = require("../controllers/reportController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.route("/").get(getReports).post(createReport);

router.route("/:id").delete(deleteReport);

module.exports = router;
