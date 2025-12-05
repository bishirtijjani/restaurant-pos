// backend/utils/responseHandler.js
// Standardized API response helper for consistent API responses

/**
 * Send a successful response
 * @param {Response} res - Express response object
 * @param {Object} options - Response options
 * @param {any} options.data - Response data
 * @param {string} options.message - Success message
 * @param {number} options.statusCode - HTTP status code (default: 200)
 * @param {Object} options.meta - Additional metadata (pagination, etc.)
 */
const sendSuccess = (res, { data = null, message = "Success", statusCode = 200, meta = {} } = {}) => {
  const response = {
    success: true,
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  // Add metadata if provided (e.g., pagination)
  if (Object.keys(meta).length > 0) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send an error response
 * @param {Response} res - Express response object
 * @param {Object} options - Response options
 * @param {string} options.message - Error message
 * @param {number} options.statusCode - HTTP status code (default: 500)
 * @param {Array} options.errors - Array of detailed errors
 * @param {string} options.code - Error code for frontend handling
 */
const sendError = (res, { message = "An error occurred", statusCode = 500, errors = [], code = null } = {}) => {
  const response = {
    success: false,
    message,
  };

  if (errors.length > 0) {
    response.errors = errors;
  }

  if (code) {
    response.code = code;
  }

  return res.status(statusCode).json(response);
};

/**
 * Common response helpers
 */
const responses = {
  // Success responses
  ok: (res, data, message = "Success") => 
    sendSuccess(res, { data, message, statusCode: 200 }),

  created: (res, data, message = "Created successfully") => 
    sendSuccess(res, { data, message, statusCode: 201 }),

  noContent: (res) => 
    res.status(204).send(),

  // Paginated response
  paginated: (res, { data, page, limit, total, message = "Success" }) => 
    sendSuccess(res, {
      data,
      message,
      meta: {
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
        },
      },
    }),

  // Error responses
  badRequest: (res, message = "Bad request", errors = []) => 
    sendError(res, { message, statusCode: 400, errors, code: "BAD_REQUEST" }),

  unauthorized: (res, message = "Unauthorized") => 
    sendError(res, { message, statusCode: 401, code: "UNAUTHORIZED" }),

  forbidden: (res, message = "Forbidden") => 
    sendError(res, { message, statusCode: 403, code: "FORBIDDEN" }),

  notFound: (res, message = "Resource not found") => 
    sendError(res, { message, statusCode: 404, code: "NOT_FOUND" }),

  conflict: (res, message = "Resource already exists") => 
    sendError(res, { message, statusCode: 409, code: "CONFLICT" }),

  validationError: (res, errors) => 
    sendError(res, { message: "Validation failed", statusCode: 400, errors, code: "VALIDATION_ERROR" }),

  serverError: (res, message = "Internal server error") => 
    sendError(res, { message, statusCode: 500, code: "SERVER_ERROR" }),
};

module.exports = {
  sendSuccess,
  sendError,
  ...responses,
};
