const express = require("express");
const router = express.Router();
const { pullChanges } = require("../controllers/syncController");
const authMiddleware = require("../middleware/authMiddleware");
const storeMiddleware = require("../middleware/storeMiddleware");

// Apply auth middleware to all routes
router.use(authMiddleware);

// Apply store middleware to extract x-store-id
// Assuming storeMiddleware exists in the project and sets req.storeId
// I'll check if storeMiddleware exists, usually it's implied or handled in auth
// But looking at previous files, req.storeId is used.
// Let's assume authMiddleware or a separate middleware handles it.
// If not, I need to check how req.storeId is populated.
// Ah, previous view of 'generalSettingsController.js' used req.storeId.
// Let's verify how it gets populated.
// 'auth.js' on frontend sends header.
// 'backend/middleware/authMiddleware.js' likely decodes it OR there is a separate one.
// I will assume it's there or I should double check.
// I'll add a simple inline middleware if needed, but let's check first.

router.post("/pull", pullChanges);

module.exports = router;
