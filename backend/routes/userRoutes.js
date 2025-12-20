const express = require("express");
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const storeMiddleware = require("../middleware/storeMiddleware");

const router = express.Router();

// Apply auth and role middleware to all routes
// Apply auth and store middleware to all routes
router.use(authMiddleware, storeMiddleware);

// Get all users (Admin & Manager)
router.get("/", roleMiddleware("admin", "manager"), getAllUsers);

// Get single user (Admin & Manager)
router.get("/:id", roleMiddleware("admin", "manager"), getUserById);

// Create user (Admin only)
router.post("/", roleMiddleware("admin"), createUser);

// Update user (Admin only)
// Note: You might want to allow managers to edit limited fields in future
router.put("/:id", roleMiddleware("admin"), updateUser);
router.put("/:id/role", roleMiddleware("admin"), updateUser);

// Delete user (Admin only)
router.delete("/:id", roleMiddleware("admin"), deleteUser);

module.exports = router;
