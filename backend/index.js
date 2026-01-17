const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const fs = require("fs");
const http = require("http");
const connectToDB = require("./config/dbConnection");
const { initializeWebSocket } = require("./utils/webSocket");
const logger = require("./utils/logger");
const setupSecurity = require("./config/security");
// Centralized Routes Import
const routes = require("./routes");

// Load environment variables first
dotenv.config();

const app = express();

// Error handling for uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception", {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

// Error handling for unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection", { reason: reason?.message || reason });
  process.exit(1);
});

const corsOptions = require("./config/corsOptions");
const { generalLimiter } = require("./middleware/rateLimitMiddleware");

// Middleware
setupSecurity(app);
app.use(cookieParser());
app.use(cors(corsOptions));

// Request logging middleware with metrics tracking
const metricsCollector = require("./utils/metricsCollector");

app.use((req, res, next) => {
  const start = Date.now();

  // Increment active requests
  metricsCollector.incrementActiveRequests();

  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.request(req, res, duration);

    // Track API metrics
    metricsCollector.trackAPIRequest(req, res, duration);

    // Decrement active requests
    metricsCollector.decrementActiveRequests();
  });

  next();
});

// Apply general rate limiting to all API routes
app.use("/api", generalLimiter);

// Database connection
connectToDB();

// Use Centralized Routes
app.use("/api", routes);

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
  logger.warn("Frontend build not found, skipping static file serving", {
    path: frontendPath,
  });
}

// Global error handler
app.use((err, req, res, next) => {
  logger.error("Express error", {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
  });
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket
initializeWebSocket(server);

// Initialize health monitoring service
const healthMonitor = require("./services/healthMonitor");

server.listen(PORT, "0.0.0.0", () => {
  logger.info("Server started", {
    port: PORT,
    env: process.env.NODE_ENV || "development",
  });

  // Start health monitoring after server is ready
  setTimeout(() => {
    healthMonitor.startMonitoring();
  }, 2000); // Wait 2 seconds for database connection to stabilize
});

// Graceful shutdown
const gracefulShutdown = () => {
  logger.info("Received shutdown signal, closing server gracefully");

  // Stop health monitoring
  healthMonitor.stopMonitoring();

  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
