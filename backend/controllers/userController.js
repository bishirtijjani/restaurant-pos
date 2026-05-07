const User = require("../models/User");
const logAction = require("../utils/logAction"); // Import log function

// Fetch all users for the current store
const getAllUsers = async (req, res) => {
  try {
    // Find users who have access to this store
    const users = await User.find({
      "stores.storeId": req.storeId,
    }).sort({ createdAt: -1 });

    // Transform to show role for this specific store
    const storeUsers = users.map((user) => {
      const storeData = user.stores.find(
        (s) => s.storeId.toString() === req.storeId.toString()
      );
      const userObj = user.toObject();
      userObj.role = storeData ? storeData.role : user.role;
      userObj.permissions = storeData ? storeData.permissions : [];
      return userObj;
    });

    res.status(200).json({ success: true, data: storeUsers });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

// Fetch a single user by ID (scoped to store)
const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findOne({
      _id: id,
      "stores.storeId": req.storeId,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found or not in this store",
      });
    }

    const storeData = user.stores.find(
      (s) => s.storeId.toString() === req.storeId.toString()
    );
    const userObj = user.toObject();
    if (storeData) {
      userObj.role = storeData.role;
      userObj.permissions = storeData.permissions;
    }

    res.status(200).json({ success: true, data: userObj });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ success: false, message: "Failed to fetch user" });
  }
};

const { DEFAULT_ROLE_PERMISSIONS } = require("../config/permissions");

// Create a new user (or add existing user to store)
const createUser = async (req, res) => {
  const { fullname, email, role, password, pinCode, permissions } = req.body;
  try {
    let user = await User.findOne({ email });
    const userPermissions = permissions || DEFAULT_ROLE_PERMISSIONS[role] || [];

    if (user) {
      // User exists - check if already in store
      const inStore = user.stores.some(
        (s) => s.storeId.toString() === req.storeId.toString()
      );
      if (inStore) {
        return res.status(400).json({
          success: false,
          message: "User already exists in this store",
        });
      }

      // Add to store
      user.stores.push({
        storeId: req.storeId,
        organizationId: req.organizationId,
        role: role,
        permissions: userPermissions,
        status: "active",
      });
      await user.save();
    } else {
      // New user
      user = new User({
        fullname,
        email,
        password,
        pinCode,
        // Set root role (optional, maybe 'user')
        role: "staff",
        currentOrganizationId: req.organizationId,
        stores: [
          {
            storeId: req.storeId,
            organizationId: req.organizationId,
            role: role, // Store specific role
            permissions: userPermissions,
            isDefault: true,
            status: "active",
          },
        ],
      });
      await user.save();
    }

    // Log action
    await logAction(
      req.user.id,
      req.storeId,
      req.organizationId,
      "User",
      user._id,
      "create",
      null,
      user,
      "User added to store",
      null // session
    );

    res.status(201).json({ success: true, data: user });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ success: false, message: "Failed to create user" });
  }
};

// Update user details (store specific role)
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { fullname, email, role, password, pinCode, permissions } = req.body;
  try {
    const user = await User.findOne({
      _id: id,
      "stores.storeId": req.storeId,
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const oldData = user.toObject();

    // Update global fields if provided
    if (fullname) user.fullname = fullname;
    if (email) user.email = email;
    if (password) user.password = password;
    if (pinCode) user.pinCode = pinCode;
    if (req.organizationId) user.currentOrganizationId = req.organizationId;

    // Update store role and permissions
    const storeIndex = user.stores.findIndex(
      (s) => s.storeId.toString() === req.storeId.toString()
    );

    if (storeIndex !== -1) {
      if (role) {
        user.stores[storeIndex].role = role;
        // If role changes but no permissions provided, optionally update to new defaults
        if (!permissions) {
          user.stores[storeIndex].permissions =
            DEFAULT_ROLE_PERMISSIONS[role] ||
            user.stores[storeIndex].permissions;
        }
      }

      if (permissions) {
        user.stores[storeIndex].permissions = permissions;
      }
    }

    const updatedUser = await user.save();

    await logAction(
      req.user.id,
      req.storeId,
      req.organizationId,
      "User",
      id,
      "edit",
      oldData,
      updatedUser.toObject(),
      "User details updated",
      null
    );

    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ success: false, message: "Failed to update user" });
  }
};

// Delete a user (Remove from store)
const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findOne({
      _id: id,
      "stores.storeId": req.storeId,
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Remove store from user's stores array
    user.stores = user.stores.filter(
      (s) => s.storeId.toString() !== req.storeId.toString()
    );

    if (user.stores.length === 0) {
      // If no stores left, delete user entirely?
      // Or keep as orphan? Let's delete to keep clean.
      await User.findByIdAndDelete(id);
    } else {
      await user.save();
    }

    // Log action
    await logAction(
      req.user.id,
      req.storeId,
      req.organizationId,
      "User",
      id,
      "delete",
      user,
      null,
      "User removed from store",
      null
    );

    res
      .status(200)
      .json({ success: true, message: "User removed successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, message: "Failed to delete user" });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};


