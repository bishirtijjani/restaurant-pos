const express = require("express");
const router = express.Router();
const {
  createStore,
  getAllStores,
  getStoreById,
  updateStore,
} = require("../controllers/storeController");

// Note: Ensure authMiddleware is applied in index.js or here
// These routes are already protected by the global authMiddleware in index.js

router.route("/").get(getAllStores).post(createStore);

router.route("/:id").get(getStoreById).put(updateStore);

module.exports = router;
