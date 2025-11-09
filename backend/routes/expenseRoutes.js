const express = require("express");
const router = express.Router();
const {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
} = require("../controllers/expenseController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Apply auth middleware to all routes
router.use(authMiddleware);

router.post("/", roleMiddleware("admin", "manager"), createExpense);
router.get(
  "/",
  roleMiddleware("admin", "manager", "staff"),
  getAllExpenses
);
router.get(
  "/:id",
  roleMiddleware("admin", "manager", "staff"),
  getExpenseById
);
router.put("/:id", roleMiddleware("admin", "manager"), updateExpense);
router.delete("/:id", roleMiddleware("admin"), deleteExpense);

module.exports = router;
