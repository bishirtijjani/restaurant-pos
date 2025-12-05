// backend/utils/logger.js
// Production-ready logging utility to replace console.log

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

// Get log level from environment (default to INFO in production, DEBUG in development)
const getLogLevel = () => {
  const envLevel = process.env.LOG_LEVEL?.toUpperCase();
  if (envLevel && LOG_LEVELS[envLevel] !== undefined) {
    return LOG_LEVELS[envLevel];
  }
  return process.env.NODE_ENV === "production" ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;
};

const currentLogLevel = getLogLevel();

/**
 * Format log message with timestamp and level
 */
const formatMessage = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";
  return `[${timestamp}] [${level}]${metaStr} ${message}`;
};

/**
 * Colorize output for development
 */
const colors = {
  ERROR: "\x1b[31m", // Red
  WARN: "\x1b[33m",  // Yellow
  INFO: "\x1b[36m",  // Cyan
  DEBUG: "\x1b[90m", // Gray
  RESET: "\x1b[0m",
};

const colorize = (level, text) => {
  if (process.env.NODE_ENV === "production") {
    return text;
  }
  return `${colors[level] || ""}${text}${colors.RESET}`;
};

/**
 * Logger object with level-based methods
 */
const logger = {
  /**
   * Error level - for errors that need immediate attention
   */
  error: (message, meta = {}) => {
    if (currentLogLevel >= LOG_LEVELS.ERROR) {
      const formatted = formatMessage("ERROR", message, meta);
      console.error(colorize("ERROR", formatted));
      
      // In production, here you would send to external service
      // e.g., Sentry, LogRocket, etc.
    }
  },

  /**
   * Warn level - for potential issues
   */
  warn: (message, meta = {}) => {
    if (currentLogLevel >= LOG_LEVELS.WARN) {
      const formatted = formatMessage("WARN", message, meta);
      console.warn(colorize("WARN", formatted));
    }
  },

  /**
   * Info level - for general operational messages
   */
  info: (message, meta = {}) => {
    if (currentLogLevel >= LOG_LEVELS.INFO) {
      const formatted = formatMessage("INFO", message, meta);
      console.log(colorize("INFO", formatted));
    }
  },

  /**
   * Debug level - for detailed debugging info
   */
  debug: (message, meta = {}) => {
    if (currentLogLevel >= LOG_LEVELS.DEBUG) {
      const formatted = formatMessage("DEBUG", message, meta);
      console.log(colorize("DEBUG", formatted));
    }
  },

  /**
   * Log HTTP request (for request logging middleware)
   */
  request: (req, res, duration) => {
    const meta = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    };
    
    if (res.statusCode >= 500) {
      logger.error("Request failed", meta);
    } else if (res.statusCode >= 400) {
      logger.warn("Request error", meta);
    } else {
      logger.info("Request completed", meta);
    }
  },

  /**
   * Log database operations
   */
  db: (operation, collection, duration, success = true) => {
    const meta = { operation, collection, duration: `${duration}ms` };
    if (success) {
      logger.debug("DB operation", meta);
    } else {
      logger.error("DB operation failed", meta);
    }
  },
};

module.exports = logger;
