const express = require("express");
const {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customerController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Route to fetch all customers
router.get(
  "/",
  roleMiddleware("admin", "manager", "cashier", "waiter"),
  getAllCustomers
);

// Route to fetch a single customer by ID
router.get(
  "/:id",
  roleMiddleware("admin", "manager", "cashier", "waiter"),
  getCustomerById
);

// Route to create a new customer
router.post(
  "/",
  roleMiddleware("admin", "manager", "cashier"),
  createCustomer
);

// Route to update customer details
router.put(
  "/:id",
  roleMiddleware("admin", "manager", "cashier"),
  updateCustomer
);

// Route to delete a customer
router.delete("/:id", roleMiddleware("admin"), deleteCustomer);

module.exports = router;
