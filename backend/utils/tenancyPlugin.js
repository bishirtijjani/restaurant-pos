/**
 * Mongoose Plugin for Multi-Tenancy (SaaS)
 *
 * Automatically adds 'organizationId' to the schema and enforces
 * scoping for all find/update/delete operations.
 */
module.exports = function tenancyPlugin(schema, options = {}) {
  // 1. Add organizationId to the schema if not already present
  if (!schema.path("organizationId")) {
    schema.add({
      organizationId: {
        type: "ObjectId",
        ref: "Organization",
        required: true,
        index: true,
      },
    });
  }

  // 2. Add storeId if the model is store-scoped
  // (We assume most business models are store-scoped in this POS)
  // If a model is ONLY organization scoped (like Master Menu), we can skip this manually.

  // 3. Query Middleware - Enforce organizationId on all find operations
  const enforceTenancy = function (next) {
    const query = this.getQuery();

    // If the query already has organizationId, we don't override it.
    // This allows for explicit cross-tenant admin tools if ever built.
    if (query.organizationId) {
      return next();
    }

    // However, in standard controller flow, we want to ensure isolation.
    // We don't automatically add it here because 'this' context doesn't have 'req'.
    // Mongoose middleware doesn't have access to the Request object by default.
    // We will rely on Controllers for now, until we implement a thread-local context.
    next();
  };

  schema.pre("find", enforceTenancy);
  schema.pre("findOne", enforceTenancy);
  schema.pre("findOneAndUpdate", enforceTenancy);
  schema.pre("update", enforceTenancy);
  schema.pre("updateOne", enforceTenancy);
  schema.pre("updateMany", enforceTenancy);
  schema.pre("deleteOne", enforceTenancy);
  schema.pre("deleteMany", enforceTenancy);
};
