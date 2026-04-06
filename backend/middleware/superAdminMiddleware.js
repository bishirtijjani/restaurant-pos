const User = require("../models/User");

const isSuperAdmin = async (req, res, next) => {
  try {
    // req.user should be populated by authMiddleware before this
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isSuperAdmin) {
      return res.status(403).json({ message: "Access denied. Super Admin privileges required." });
    }

    next();
  } catch (error) {
    console.error("Super Admin check failed:", error);
    res.status(500).json({ message: "Server error during authorization check" });
  }
};

module.exports = { isSuperAdmin };
