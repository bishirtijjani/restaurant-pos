const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const User = require("../models/User");

// Load env vars from backend directory when running from project root
const envPath = path.resolve(__dirname, "../.env");
dotenv.config({ path: envPath });

const changePassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
    console.log("MongoDB Connected...");

    const email = process.argv[2];
    const newPassword = process.argv[3];

    if (!email || !newPassword) {
      console.log("Usage: node scripts/changePassword.js <email> <new-password>");
      console.log("Example: node scripts/changePassword.js admin@codeket.com admin123");
      process.exit(1);
    }

    const user = await User.findOne({ email });

    if (!user) {
      console.log(`User with email ${email} not found.`);
      process.exit(1);
    }

    user.password = newPassword;
    await user.save();

    console.log(`Success! Password for ${user.email} has been changed.`);
    console.log(`User: ${user.fullname} (${user.email})`);
    console.log(`New password: ${newPassword}`);

    process.exit(0);
  } catch (error) {
    console.error("Error changing password:", error);
    process.exit(1);
  }
};

changePassword();
