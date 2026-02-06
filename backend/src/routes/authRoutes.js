const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authValidator = require("../validators/authValidator");
const { validate } = require("../middleware/validate");
const { auth, adminAuth } = require("../middleware/auth");
const { uploadAvatar, handleUploadError } = require("../middleware/upload");
// const { authLimiter } = require("../middleware/rateLimit");

// Apply rate limiting to auth routes
// router.use(authLimiter);

// Public routes
router.post(
  "/register",
  authValidator.register,
  validate,
  authController.register,
);

router.post("/login", authValidator.login, validate, authController.login);

// Protected routes (require authentication)
router.get("/profile", auth, authController.getProfile);

router.put(
  "/profile",
  auth,
  authValidator.updateProfile,
  validate,
  authController.updateProfile,
);

router.put(
  "/change-password",
  auth,
  authValidator.changePassword,
  validate,
  authController.changePassword,
);

router.put(
  "/avatar",
  auth,
  uploadAvatar,
  handleUploadError,
  authController.updateAvatar,
);

router.post("/logout", auth, authController.logout);

// Admin only routes
router.post("/admin/impersonate", adminAuth, authController.adminImpersonate);

module.exports = router;
