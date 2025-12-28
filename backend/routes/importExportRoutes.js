const express = require("express");
const router = express.Router();
const multer = require("multer");
const { importData } = require("../controllers/importExportController");

// Multer Configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for bulk files
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "text/csv" ||
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.mimetype === "application/vnd.ms-excel"
    ) {
      cb(null, true);
    } else {
      cb(
        new Error("Invalid file type. Only CSV and Excel files are allowed."),
        false
      );
    }
  },
});

/**
 * @route POST /api/import/:type
 * @desc Import data for a specific entity type (e.g., category, menu-item)
 * @access Private
 */
router.post("/:type", upload.single("file"), importData);

/**
 * @route GET /api/import/:type/export
 * @desc Export data for a specific entity type
 * @access Private
 */
const { exportData } = require("../controllers/importExportController");
router.get("/:type/export", exportData);

module.exports = router;
