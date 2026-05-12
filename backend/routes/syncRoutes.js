const express = require("express");
const router = express.Router();
const { pullChanges, pushChanges } = require("../controllers/syncController");
const authMiddleware = require("../middleware/authMiddleware");
const storeMiddleware = require("../middleware/storeMiddleware");
const idempotencyMiddleware = require("../middleware/idempotencyMiddleware");

// Apply auth + store middleware to all sync routes
router.use(authMiddleware);
router.use(storeMiddleware);

router.post("/pull", pullChanges);
router.post("/push", idempotencyMiddleware, pushChanges);

module.exports = router;
