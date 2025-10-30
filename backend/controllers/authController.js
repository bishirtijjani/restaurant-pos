const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const register = async (req, res) => {
  console.log(" trying");
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

    // Check if user already exists with the same email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User Email already registered" });
    }

    // Check if this is the first user (to make them admin)
    const userCount = await User.countDocuments({});
    const role = userCount === 0 ? "admin" : "staff";

    // Create new user with appropriate role
    const user = await User.create({
      fullname,
      email,
      password,
      role,
      securityQuestions,
    });

    res.status(201).json({
      message:
        userCount === 0
          ? "Admin user created successfully"
          : "User created successfully",
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  console.log("login attempt");
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, deletedAt: null });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user?.role }, "68149540", {
      expiresIn: "3d",
    });

    const userResponse = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      role: user.role,
    };

    res.json({ token, user: userResponse });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
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
    const user = await User.findById(userId).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    // Remove hashed security answers from response
    const userResponse = user.toObject();
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
  getSecurityQuestions,
  verifySecurityAnswers,
  getCurrentUser,
  updateCurrentUser,
};
