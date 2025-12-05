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
const { authLimiter } = require("../middleware/rateLimitMiddleware");
const { validateBody, schemas } = require("../middleware/validationMiddleware");
const router = express.Router();

// Apply rate limiting and validation to sensitive auth endpoints
router.post("/register", authLimiter, validateBody(schemas.register), register);
router.post("/login", authLimiter, validateBody(schemas.login), login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.post("/get-security-questions", authLimiter, getSecurityQuestions);
router.post("/verify-security-answers", authLimiter, verifySecurityAnswers);
router.get("/me", authMiddleware, getCurrentUser);
router.put("/me", authMiddleware, updateCurrentUser);

module.exports = router;
