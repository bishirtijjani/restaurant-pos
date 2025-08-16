const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const JWT_SECRET = process.env.JWT_SECRET;

const register = async (req, res) => {
  try {
    const { fullname, email, password } = req.body;

    if (!fullname || !email || !password) {
    }
    // Log the incoming request body to ensure the correct data

    // Check if user already exists with the same email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User Email already registered" });
    }

    // Create new user
    const user = await User.create({ fullname, email, password });

    // Log successful user creation

    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    // Log error details for debugging
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user?.role }, JWT_SECRET, {
      expiresIn: "2h",
    });
    res.json({ token, user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex");

    // Set token and expiry in user document
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiry
    await user.save();

    // Send email with reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
      service: "Gmail", // or another provider
      auth: {
        user: `${process.env.USER_EMAIL_ADDRESS}`,
        pass: `${process.env.USER_EMAIL_PASSWORD}`,
      },
    });

    const mailOptions = {
      from: '"Bishir TM" <no-reply@yourapp.com>',
      to: user.email,
      subject: "Password Reset Request",
      text: `You requested a password reset. Click the link below to reset your password:\n\n${resetLink}\n\nIf you didn't request this, please ignore this email.`,
    };

    await transporter.sendMail(mailOptions);

    res
      .status(200)
      .json({ message: "Password reset link sent to your email." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error sending reset email." });
  }
};

const handlePasswordReset = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Check if token is still valid
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    // Update password and clear reset fields
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: "Password reset successful. You can now log in." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error resetting password." });
  }
};

// Get current user data
const getCurrentUser = async (req, res) => {
  try {
    // `req.user` is set by the authMiddleware and contains the decoded JWT token
    const userId = req.user.id;

    // Find user by ID
    const user = await User.findById(userId).select("-password"); // Don't include the password field

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return user data without the password
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  register,
  login,
  requestPasswordReset,
  handlePasswordReset,
  getCurrentUser,
};
