const express = require("express");
const router = express.Router();
const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Apply auth middleware to all routes
router.use(authMiddleware);

router.post(
  "/",
  roleMiddleware("admin", "manager"),
  createCategory
);
router.get(
  "/",
  roleMiddleware("admin", "manager", "staff"),
  getCategories
);
router.get(
  "/:id",
  roleMiddleware("admin", "manager", "staff"),
  getCategoryById
);
router.put(
  "/:id",
  roleMiddleware("admin", "manager"),
  updateCategory
);
router.delete("/:id", roleMiddleware("admin"), deleteCategory);

module.exports = router;
