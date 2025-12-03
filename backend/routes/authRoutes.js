const express = require("express");
const {
  register,
  login,
  refreshToken,
  logout,
  getSecurityQuestions,
  verifySecurityAnswers,
  getCurrentUser,
  updateCurrentUser,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.post("/get-security-questions", getSecurityQuestions);
router.post("/verify-security-answers", verifySecurityAnswers);
router.get("/me", authMiddleware, getCurrentUser);
router.put("/me", authMiddleware, updateCurrentUser);

module.exports = router;
