const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: [
        "admin",
        "manager",
        "cashier",
        "waiter",
        "kitchen",
        "accountant",
        "staff",
      ],
      required: true,
      default: "staff",
    },
    securityQuestions: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true }, // Will be hashed
      },
    ],
    lastAction: {
      action: {
        type: String,
        enum: ["create", "update", "edit", "delete"],
        default: null,
      },
      performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      createdAt: { type: Date, default: null },
      reason: { type: String, default: null },
    },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  // Hash security answers before saving
  if (this.isModified("securityQuestions")) {
    for (let i = 0; i < this.securityQuestions.length; i++) {
      if (this.securityQuestions[i].answer) {
        // Convert answer to lowercase for case-insensitive comparison
        const answerLower = this.securityQuestions[i].answer
          .toLowerCase()
          .trim();
        this.securityQuestions[i].answer = await bcrypt.hash(answerLower, 10);
      }
    }
  }

  next();
});

module.exports = mongoose.model("User", userSchema);
