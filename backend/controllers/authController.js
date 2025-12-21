const User = require("../models/User");
const Store = require("../models/Store");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Helper to generate tokens
const generateTokens = (user) => {
  // Use the global role or the first store role - mainly for initial auth
  // The storeMiddleware will refine this per request.
  // We prefer the 'admin' if they have it anywhere, or just 'staff'
  const effectiveRole =
    user.role ||
    (user.stores && user.stores.length > 0 ? user.stores[0].role : "staff");

  const accessToken = jwt.sign(
    {
      id: user._id,
      role: effectiveRole,
      email: user.email,
      fullname: user.fullname,
    },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

const register = async (req, res) => {
  try {
    const { fullname, email, password, securityQuestions } = req.body;

    if (!fullname || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate security questions
    if (!securityQuestions || securityQuestions.length !== 2) {
      return res.status(400).json({
        message: "Two security questions are required",
      });
    }

    // Validate that questions and answers are provided
    for (let i = 0; i < securityQuestions.length; i++) {
      if (!securityQuestions[i].question || !securityQuestions[i].answer) {
        return res.status(400).json({
          message: "Both security questions must have questions and answers",
        });
      }
      if (securityQuestions[i].answer.trim().length < 2) {
        return res.status(400).json({
          message: "Security answers must be at least 2 characters long",
        });
      }
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User Email already registered" });
    }

    // --- SaaS Logic: Registration = New Tenant (User + Store) ---

    // 1. Create the User
    const user = new User({
      fullname,
      email,
      password,
      pinCode: req.body.pinCode || null,
      securityQuestions,
      // Global role is deprecated but set to admin for the signup user
      role: "admin",
    });

    // 2. Create their first Store
    const newStore = await Store.create({
      name: `${fullname.split(" ")[0]}'s Restaurant`,
      ownerId: user._id,
      status: "active",
      settings: {
        restaurantName: `${fullname}'s Restaurant`,
        // Inherits default settings from Schema
      },
    });

    // 3. Link Store to User
    user.stores = [
      {
        storeId: newStore._id,
        role: "admin",
        isDefault: true,
        permissions: ["all"],
        status: "active",
      },
    ];
    user.lastActiveStore = newStore._id;

    // 4. Save User
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    user.refreshTokens.push({
      token: await bcrypt.hash(refreshToken, 10),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    await user.save();

    // Send refresh token in HttpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Populate store info for response
    await user.populate("stores.storeId", "name settings.restaurantName");

    res.status(201).json({
      message: "Account and Store created successfully",
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: "admin",
        stores: user.stores, // Important: Sends back the new store
        lastActiveStore: user.lastActiveStore,
      },
      token: accessToken,
    });
  } catch (error) {
    console.error("Register Error", error);
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Populate stores to return to frontend
    const user = await User.findOne({ email, deletedAt: null }).populate(
      "stores.storeId",
      "name settings.restaurantName settings.restaurantLogo"
    );

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Remove old refresh tokens
    user.refreshTokens = user.refreshTokens.filter(
      (rt) => rt.expiresAt > Date.now()
    );

    // Save new refresh token
    user.refreshTokens.push({
      token: await bcrypt.hash(refreshToken, 10),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });
    await user.save();

    // Send refresh token in HttpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const userResponse = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      role: user.role, // Legacy global role
      stores: user.stores, // The crucial list for the switcher
      lastActiveStore:
        user.lastActiveStore ||
        (user.stores[0] ? user.stores[0].storeId : null),
    };

    res.json({ token: accessToken, user: userResponse });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

const pinLogin = async (req, res) => {
  try {
    const { email, pinCode } = req.body;

    if (!email || !pinCode) {
      return res.status(400).json({ message: "Email and PIN are required" });
    }

    // Populate stores to return to frontend
    const user = await User.findOne({ email, deletedAt: null }).populate(
      "stores.storeId",
      "name settings.restaurantName settings.restaurantLogo"
    );

    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    if (!user.pinCode)
      return res
        .status(400)
        .json({ message: "PIN login not set up for this user" });

    const isMatch = await bcrypt.compare(pinCode, user.pinCode);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Remove old refresh tokens
    user.refreshTokens = user.refreshTokens.filter(
      (rt) => rt.expiresAt > Date.now()
    );

    // Save new refresh token
    user.refreshTokens.push({
      token: await bcrypt.hash(refreshToken, 10),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });
    await user.save();

    // Send refresh token in HttpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const userResponse = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      role: user.role,
      stores: user.stores,
      lastActiveStore:
        user.lastActiveStore ||
        (user.stores[0] ? user.stores[0].storeId : null),
    };

    res.json({ token: accessToken, user: userResponse });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token required" });
    }

    res.clearCookie("refreshToken");

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.id, deletedAt: null });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Find the token in the user's refreshTokens array
    // Since tokens are hashed, we need to compare
    let tokenIndex = -1;
    for (let i = 0; i < user.refreshTokens.length; i++) {
      const rt = user.refreshTokens[i];
      const isMatch = await bcrypt.compare(refreshToken, rt.token);
      if (isMatch) {
        tokenIndex = i;
        break;
      }
    }

    if (tokenIndex === -1) {
      // Token reuse detection could go here (delete all tokens if reused)
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    // Remove the used refresh token (Rotation)
    user.refreshTokens.splice(tokenIndex, 1);

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    // Save new refresh token
    user.refreshTokens.push({
      token: await bcrypt.hash(newRefreshToken, 10),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });
    await user.save();

    // Send new refresh token in cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ token: accessToken });
  } catch (error) {
    console.log(error);
    if (error.name === "JsonWebTokenError") {
      return res.status(403).json({ message: "Invalid refresh token" });
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        if (decoded && decoded.id) {
          const user = await User.findById(decoded.id);
          if (user) {
            // Find and remove the specific refresh token
            let tokenIndex = -1;
            for (let i = 0; i < user.refreshTokens.length; i++) {
              const isMatch = await bcrypt.compare(
                refreshToken,
                user.refreshTokens[i].token
              );
              if (isMatch) {
                tokenIndex = i;
                break;
              }
            }

            if (tokenIndex !== -1) {
              user.refreshTokens.splice(tokenIndex, 1);
              await user.save();
            }
          }
        }
      } catch (err) {
        // Token might be invalid or expired, just ignore and clear cookie
        console.log("Logout token verification failed:", err.message);
      }
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get security questions for a user
const getSecurityQuestions = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email, deletedAt: null });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return only the questions, not the answers
    const questions = user.securityQuestions.map((sq, index) => ({
      index,
      question: sq.question,
    }));

    res.status(200).json({
      success: true,
      questions,
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving security questions" });
  }
};

// Verify security answers and reset password
const verifySecurityAnswers = async (req, res) => {
  try {
    const { email, answers, newPassword } = req.body;

    if (!email || !answers || !newPassword) {
      return res.status(400).json({
        message: "Email, security answers, and new password are required",
      });
    }

    if (answers.length !== 2) {
      return res.status(400).json({
        message: "Both security answers are required",
      });
    }

    const user = await User.findOne({ email, deletedAt: null });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify both security answers
    let allAnswersCorrect = true;
    for (let i = 0; i < answers.length; i++) {
      const answerLower = answers[i].trim().toLowerCase();
      const isMatch = await bcrypt.compare(
        answerLower,
        user.securityQuestions[i].answer
      );
      if (!isMatch) {
        allAnswersCorrect = false;
        break;
      }
    }

    if (!allAnswersCorrect) {
      return res.status(400).json({
        message: "Security answers are incorrect",
      });
    }

    // Update password
    user.password = newPassword; // Will be hashed by pre-save hook
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful. You can now log in.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error resetting password" });
  }
};

// Get current user data
const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    // Populate stores
    const user = await User.findById(userId)
      .select("-password")
      .populate(
        "stores.storeId",
        "name settings.restaurantName settings.restaurantLogo"
      );

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    // Remove hashed security answers from response
    const userResponse = user.toObject();

    // Ensure we send back the useful store info (populated)
    // The previous .toObject() keeps it populated.
    // Explicitly ensure 'stores' is included (it is by default in Mongoose object)

    if (userResponse.securityQuestions) {
      userResponse.securityQuestions = userResponse.securityQuestions.map(
        (sq) => ({
          question: sq.question,
          // Don't send the answer
        })
      );
    }

    res.status(200).json({ success: true, user: userResponse });
  } catch (error) {
    console.error("GetCurrentUser Error", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Allow current user to update profile
const updateCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullname, email, password, securityQuestions } = req.body;

    const user = await User.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing)
        return res
          .status(400)
          .json({ success: false, message: "Email already in use" });
      user.email = email;
    }

    if (fullname) user.fullname = fullname;
    if (pinCode) user.pinCode = pinCode;

    if (password) {
      user.password = password; // Will be hashed by pre-save hook
    }

    // Update security questions if provided
    if (securityQuestions && securityQuestions.length === 2) {
      // Validate security questions
      for (let i = 0; i < securityQuestions.length; i++) {
        if (!securityQuestions[i].question || !securityQuestions[i].answer) {
          return res.status(400).json({
            success: false,
            message: "Both security questions must have questions and answers",
          });
        }
        if (securityQuestions[i].answer.trim().length < 2) {
          return res.status(400).json({
            success: false,
            message: "Security answers must be at least 2 characters long",
          });
        }
      }
      user.securityQuestions = securityQuestions;
    }

    user.lastAction = {
      action: "update",
      performedBy: req.user.id,
      createdAt: new Date(),
      reason: req.body.reason || "Profile update",
    };

    await user.save();

    const safeUser = user.toObject();
    delete safeUser.password;

    // Remove hashed security answers from response
    if (safeUser.securityQuestions) {
      safeUser.securityQuestions = safeUser.securityQuestions.map((sq) => ({
        question: sq.question,
      }));
    }

    res.status(200).json({ success: true, user: safeUser });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
};

module.exports = {
  register,
  login,
  pinLogin,
  refreshToken,
  logout,
  getSecurityQuestions,
  verifySecurityAnswers,
  getCurrentUser,
  updateCurrentUser,
};
