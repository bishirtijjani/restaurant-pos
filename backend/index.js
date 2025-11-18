const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const http = require("http");
const connectToDB = require("./config/dbConnection");
const { initializeWebSocket } = require("./utils/webSocket");

const app = express();

// Error handling for uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

// Error handling for unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

const corsOptions = require("./config/corsOptions");

// Middleware
dotenv.config();
app.use(express.json());
app.use(cors());

// Database connection
connectToDB();

// API routes
app.use("/api", require("./routes/index"));

// Serve static files from React build (only if the build exists)
const frontendPath = path.join(__dirname, "../frontend/dist");
const indexHtml = path.join(frontendPath, "index.html");

if (fs.existsSync(frontendPath) && fs.existsSync(indexHtml)) {
  app.use(express.static(frontendPath));

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/ws"))
      return next();
    res.sendFile(indexHtml);
  });
} else {
  console.warn(
    `Frontend build not found at ${frontendPath}. Skipping static file serving.`
  );
}

// Error handler
app.use((err, req, res, next) => {
  console.error("Express error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket
initializeWebSocket(server);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
