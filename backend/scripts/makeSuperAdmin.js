const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");

// Load env vars
dotenv.config({ path: ".env" });

const makeSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
    console.log("MongoDB Connected...");

    const email = process.argv[2];
    
    let user;
    if (email) {
      user = await User.findOneAndUpdate(
        { email },
        { isSuperAdmin: true },
        { new: true }
      );
    } else {
      user = await User.findOneAndUpdate(
        {},
        { isSuperAdmin: true },
        { new: true, sort: { createdAt: 1 } }
      );
    }

    if (!user) {
      console.log(`User with email ${email} not found.`);
    } else {
      console.log(`Success! ${user.fullname} (${user.email}) is now a Super Admin.`);
    }

    process.exit(0);
  } catch (error) {
    console.error("Error making user super admin:", error);
    process.exit(1);
  }
};

makeSuperAdmin();
