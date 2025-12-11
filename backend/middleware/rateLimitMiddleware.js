// backend/middleware/rateLimitMiddleware.js
// Simple in-memory rate limiting middleware

const rateLimitStore = new Map();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now - data.windowStart > 60000) {
      rateLimitStore.delete(key);
    }
  }
}, 300000);

/**
 * Creates a rate limiting middleware
 * @param {Object} options
 * @param {number} options.windowMs - Time window in milliseconds (default: 60000 = 1 min)
 * @param {number} options.max - Max requests per window (default: 100)
 * @param {string} options.message - Error message for rate limit exceeded
 */
const createRateLimiter = (options = {}) => {
  const {
    windowMs = 60000, // 1 minute
    max = 100,
    message = "Too many requests, please try again later.",
  } = options;

  return (req, res, next) => {
    // Create unique key based on IP and user ID (if authenticated)
    const userId = req.user?.id || "anonymous";
    const ip = req.ip || req.connection.remoteAddress;
    const key = `${ip}-${userId}`;

    const now = Date.now();
    const windowStart = now - windowMs;

    let record = rateLimitStore.get(key);

    if (!record || record.windowStart < windowStart) {
      // Start new window
      record = {
        windowStart: now,
        count: 1,
      };
      rateLimitStore.set(key, record);
    } else {
      // Increment count in current window
      record.count++;
    }

    // Set rate limit headers
    res.set({
      "X-RateLimit-Limit": max,
      "X-RateLimit-Remaining": Math.max(0, max - record.count),
      "X-RateLimit-Reset": new Date(record.windowStart + windowMs).toISOString(),
    });

    if (record.count > max) {
      return res.status(429).json({
        success: false,
        message,
        retryAfter: Math.ceil((record.windowStart + windowMs - now) / 1000),
      });
    }

    next();
  };
};

// Pre-configured rate limiters for different use cases
module.exports = {
  createRateLimiter,
  
  // General API rate limiter (100 requests per minute)
  generalLimiter: createRateLimiter({
    windowMs: 60000,
    max: 100,
    message: "Too many requests, please try again later.",
  }),

  // Auth rate limiter (stricter for login/register - 5 per minute)
  authLimiter: createRateLimiter({
    windowMs: 60000,
    max: 20,
    message: "Too many authentication attempts. Please wait a minute before trying again.",
  }),

  // Sensitive operations rate limiter (10 per minute)
  sensitiveLimiter: createRateLimiter({
    windowMs: 60000,
    max: 10,
    message: "Rate limit exceeded for sensitive operations. Please slow down.",
  }),
};
