const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const connectToDB = require("./config/dbConnection");

const app = express();

// Error handling for uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  // Perform graceful shutdown if needed
  process.exit(1);
});

// Middleware
dotenv.config();

app.use(express.json());
app.use(cors());

// Database connection with error handling
connectToDB();

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error("Express error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// API routes
app.use("/api", require("./routes/index"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Process running from:", process.cwd());
});
