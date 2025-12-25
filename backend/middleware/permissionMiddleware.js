/**
 * Middleware to check if a user has specific granular permissions.
 * This middleware depends on 'storeMiddleware' being called first to inject 'req.user.permissions'.
 *
 * @param {String|Array} requiredPermissions - The permission(s) required to access the route.
 */
const permissionMiddleware = (requiredPermissions) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const userPermissions = req.user.permissions || [];

      // 1. Check for universal access
      if (userPermissions.includes("all")) {
        return next();
      }

      // 2. Normalize requiredPermissions to an array
      const permissionsToCheck = Array.isArray(requiredPermissions)
        ? requiredPermissions
        : [requiredPermissions];

      // 3. Verify if user has at least one of the required permissions (OR logic)
      // or all of them (AND logic)? In most cases, OR is what we want for routes.
      // If we need AND, we can add a flag later.
      const hasPermission = permissionsToCheck.some((p) =>
        userPermissions.includes(p)
      );

      if (!hasPermission) {
        return res.status(403).json({
          message:
            "Forbidden: You do not have the required permissions for this action",
          required: requiredPermissions,
        });
      }

      next();
    } catch (error) {
      console.error("Permission Middleware Error:", error);
      res
        .status(500)
        .json({ message: "Internal Server Error in Permission Context" });
    }
  };
};

module.exports = permissionMiddleware;
