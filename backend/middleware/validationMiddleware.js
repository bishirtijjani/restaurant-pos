// backend/middleware/validationMiddleware.js
// Request validation middleware using a simple schema validation approach

/**
 * Creates a validation middleware for request body
 * @param {Object} schema - Validation schema object
 * @returns Express middleware function
 */
const validateBody = (schema) => {
  return (req, res, next) => {
    const errors = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field];

      // Check required
      if (rules.required && (value === undefined || value === null || value === "")) {
        errors.push(`${field} is required`);
        continue;
      }

      // Skip further validation if field is optional and not provided
      if (!rules.required && (value === undefined || value === null)) {
        continue;
      }

      // Type validation
      if (rules.type && value !== undefined) {
        const actualType = Array.isArray(value) ? "array" : typeof value;
        if (actualType !== rules.type) {
          errors.push(`${field} must be of type ${rules.type}`);
        }
      }

      // Min length (for strings and arrays)
      if (rules.minLength !== undefined) {
        if (typeof value === "string" && value.length < rules.minLength) {
          errors.push(`${field} must be at least ${rules.minLength} characters`);
        }
        if (Array.isArray(value) && value.length < rules.minLength) {
          errors.push(`${field} must have at least ${rules.minLength} items`);
        }
      }

      // Max length
      if (rules.maxLength !== undefined) {
        if (typeof value === "string" && value.length > rules.maxLength) {
          errors.push(`${field} must be at most ${rules.maxLength} characters`);
        }
      }

      // Min value (for numbers)
      if (rules.min !== undefined && typeof value === "number") {
        if (value < rules.min) {
          errors.push(`${field} must be at least ${rules.min}`);
        }
      }

      // Max value
      if (rules.max !== undefined && typeof value === "number") {
        if (value > rules.max) {
          errors.push(`${field} must be at most ${rules.max}`);
        }
      }

      // Enum validation
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(`${field} must be one of: ${rules.enum.join(", ")}`);
      }

      // Pattern validation (regex)
      if (rules.pattern && typeof value === "string") {
        if (!rules.pattern.test(value)) {
          errors.push(rules.patternMessage || `${field} format is invalid`);
        }
      }

      // Email validation
      if (rules.email && typeof value === "string") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors.push(`${field} must be a valid email address`);
        }
      }

      // Custom validator
      if (rules.custom && typeof rules.custom === "function") {
        const customError = rules.custom(value, req.body);
        if (customError) {
          errors.push(customError);
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    next();
  };
};

/**
 * Validates request params
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    const errors = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = req.params[field];

      if (rules.required && !value) {
        errors.push(`Parameter ${field} is required`);
      }

      // MongoDB ObjectId validation
      if (rules.mongoId && value) {
        const objectIdRegex = /^[0-9a-fA-F]{24}$/;
        if (!objectIdRegex.test(value)) {
          errors.push(`${field} must be a valid ID`);
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid parameters",
        errors,
      });
    }

    next();
  };
};

/**
 * Validates query parameters
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    const errors = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = req.query[field];

      if (rules.required && !value) {
        errors.push(`Query parameter ${field} is required`);
      }

      if (rules.enum && value && !rules.enum.includes(value)) {
        errors.push(`${field} must be one of: ${rules.enum.join(", ")}`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid query parameters",
        errors,
      });
    }

    next();
  };
};

// Common validation schemas for reuse
const schemas = {
  mongoId: { required: true, mongoId: true },
  
  // Order schemas
  createOrder: {
    orderType: { required: true, type: "string", enum: ["dine-in", "takeaway", "delivery", "walk-in"] },
    orderItems: { required: true, type: "array", minLength: 1 },
  },

  // Reservation schemas
  createReservation: {
    customerName: { required: true, type: "string", minLength: 2 },
    customerPhone: { required: true, type: "string" },
    partySize: { required: true, type: "number", min: 1 },
    reservationDate: { required: true, type: "string" },
    reservationTime: { required: true, type: "string" },
  },

  // Auth schemas
  login: {
    email: { required: true, email: true },
    password: { required: true, type: "string", minLength: 6 },
  },

  register: {
    fullname: { required: true, type: "string", minLength: 2 },
    email: { required: true, email: true },
    password: { required: true, type: "string", minLength: 6 },
    role: { required: true, enum: ["admin", "manager", "cashier", "waiter", "kitchen"] },
  },
};

module.exports = {
  validateBody,
  validateParams,
  validateQuery,
  schemas,
};
