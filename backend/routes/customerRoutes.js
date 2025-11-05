const express = require("express");
const {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customerController");

const router = express.Router();

// Route to fetch all customers
router.get("/", getAllCustomers);

// Route to fetch a single customer by ID
router.get("/:id", getCustomerById);

// Route to create a new customer
router.post("/", createCustomer);

// Route to update customer details
router.put("/:id", updateCustomer);

// Route to delete a customer
router.delete("/:id", deleteCustomer);

module.exports = router;
