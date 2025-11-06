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
  process.exit(1);
});

// Middleware
dotenv.config();
app.use(express.json());
app.use(cors());

// Database connection
connectToDB();

// API routes
app.use("/api", require("./routes/index"));

// Serve static files from React build (only if the build exists)
const frontendPath = path.join(__dirname, "../frontend/dist"); // adjust path if needed
const indexHtml = path.join(frontendPath, "index.html");

if (fs.existsSync(frontendPath) && fs.existsSync(indexHtml)) {
  app.use(express.static(frontendPath));

  // Fallback for SPA routing (only for non-API routes)
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(indexHtml);
  });
} else {
  console.warn(
    `Frontend build not found at ${frontendPath}. Skipping static file serving. Run the frontend build (e.g. cd frontend && npm run build) or adjust the path.`
  );
}

// Error handler (put this after routes)
app.use((err, req, res, next) => {
  console.error("Express error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
