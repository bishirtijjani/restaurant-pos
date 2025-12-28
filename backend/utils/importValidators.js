const Joi = require("joi");

/**
 * Validation Schemas for Import Entities
 * Defines the expected structure and rules for data being imported.
 */
const importSchemas = {
  category: Joi.object({
    name: Joi.string().required().trim().max(100).messages({
      "any.required": "Category name is required",
      "string.empty": "Category name cannot be empty",
      "string.max": "Category name cannot exceed 100 characters",
    }),
    description: Joi.string().allow("", null).optional().trim().max(500),
    publishStatus: Joi.string()
      .valid("draft", "published")
      .default("published")
      .optional()
      .messages({
        "any.only": 'Publish status must be either "draft" or "published"',
      }),
  }),
};

/**
 * Validates a single data row against the specified entity schema.
 * @param {string} type - The entity type (e.g., 'category')
 * @param {Object} data - The row data to validate
 * @returns {Object} - { value, error } from Joi validation
 */
const validateImportData = (type, data) => {
  const schema = importSchemas[type];
  if (!schema) {
    throw new Error(`No validation schema found for type: ${type}`);
  }
  // abortEarly: false checks all fields and returns all errors found
  // stripUnknown: true removes any fields not defined in the schema
  return schema.validate(data, { abortEarly: false, stripUnknown: true });
};

module.exports = {
  validateImportData,
  importSchemas,
};
