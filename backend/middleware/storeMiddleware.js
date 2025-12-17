const mongoose = require("mongoose");

/**
 * Store Middleware
 *
 * 1. Checks for 'x-store-id' header
 * 2. Verifies the logged-in user has access to this store
 * 3. Sets req.storeId and updates req.user.role to the store-specific role
 */
const storeMiddleware = async (req, res, next) => {
  try {
    // 1. Ensure User is logged in (Authentication)
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // 2. Get Store ID from Header
    const storeIdHeader = req.headers["x-store-id"];

    // For now, if no header is provided and user has only 1 store, assume that one.
    // This helps with backward compatibility during dev.
    // In strict production, we might enforce the header.
    let targetStoreId = storeIdHeader;

    // 3. Find the store link in user's profile
    // req.user is usually hydrated by authMiddleware.
    // However, authMiddleware might have minimal info.
    // We need the full 'stores' array.
    // Assuming authMiddleware attaches the full DB user or we fetch it here?
    // Let's check authMiddleware.js first to be safe, but usually it attaches { id, role, ... }.
    // If it acts on JWT payload, the payload might not have the updated stores list.
    // It is safer to fetch the user fresh or trust req.user if it was fetched fresh.
    // OPTIMIZATION: If req.user is just from JWT, we might need to fetch user here.
    // Let's assume for high security/consistency we need to check the DB or assume req.user is fresh.
    // Checking authController, generateTokens puts 'role' in JWT. It doesn't put 'stores'.
    // So 'req.user' from JWT won't have 'stores'.
    // WE MUST FETCH THE USER HERE to be sure of current permissions.

    // Lazy load the User model to avoid circular deps if any
    const User = mongoose.model("User");
    const user = await User.findById(req.user.id).select(
      "stores lastActiveStore"
    );

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Auto-select logic if header is missing
    if (!targetStoreId) {
      if (user.stores.length === 1) {
        targetStoreId = user.stores[0].storeId.toString();
      } else if (user.lastActiveStore) {
        targetStoreId = user.lastActiveStore.toString();
      } else {
        return res
          .status(400)
          .json({ message: "Store ID header (x-store-id) is required" });
      }
    }

    // 4. Validate Access
    const storeLink = user.stores.find(
      (s) => s.storeId.toString() === targetStoreId
    );

    if (!storeLink) {
      return res
        .status(403)
        .json({ message: "Access to this store is denied" });
    }

    if (storeLink.status === "suspended") {
      return res
        .status(403)
        .json({ message: "Your access to this store has been suspended" });
    }

    // 5. Inject Context
    req.storeId = targetStoreId;

    // CRITICAL: Override the global "role" with the context specific "role"
    // The previous authMiddleware might have set req.user.role from the Token (Global Identity).
    // We update it so Controllers verify the correct role.
    req.user.role = storeLink.role;
    req.user.permissions = storeLink.permissions || [];
    req.user.isDefaultStore = storeLink.isDefault;

    // Optional: Update lastActiveStore for convenience (async, don't await)
    if (user.lastActiveStore?.toString() !== targetStoreId) {
      user.lastActiveStore = targetStoreId;
      user
        .save()
        .catch((err) => console.error("Failed to update lastActiveStore", err));
    }

    next();
  } catch (error) {
    console.error("Store Middleware Error:", error);
    res.status(500).json({ message: "Internal Server Error in Store Context" });
  }
};

module.exports = storeMiddleware;
