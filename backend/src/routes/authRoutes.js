const express = require("express");
const {
  register,
  login,
  logout,
  makeAdmin,
  getProfile,
  getAllUsers,
} = require("../controllers/authController.js");
const { validateRequest } = require("../middleware/validateRequest.js");
const {
  registerSchema,
  loginSchema,
  makeAdminSchema, // Import the new schema
} = require("../validators/authValidators.js");
const { authMiddleware } = require("../middleware/authMiddleware.js");

const router = express.Router();

// Public routes
router.post("/register", validateRequest(registerSchema), register);
router.post("/login", validateRequest(loginSchema), login);
router.post("/logout", logout);

// Protected routes (require authentication)
router.get("/profile", authMiddleware, getProfile);

// Admin routes (with validation)
router.post("/make-admin", validateRequest(makeAdminSchema), makeAdmin);
router.get("/users", authMiddleware, getAllUsers);

module.exports = router;
