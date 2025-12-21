const express = require("express");
const router = express.Router();
const {
  createStore,
  getAllStores,
  getStoreById,
  updateStore,
} = require("../controllers/storeController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const storeMiddleware = require("../middleware/storeMiddleware");

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all stores (User access) vs Create Store (Admin only)
router.route("/").get(getAllStores).post(roleMiddleware("admin"), createStore);

router.route("/:id").get(getStoreById).put(updateStore);

module.exports = router;
