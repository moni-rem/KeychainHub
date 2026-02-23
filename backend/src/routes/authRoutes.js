const express = require("express");
const { register, login, logout } = require("../controllers/authController.js");
const { validateRequest } = require("../middleware/validateRequest.js");
const {
  registerSchema,
  loginSchema,
} = require("../validators/authValidators.js");

const router = express.Router();

router.post("/register", validateRequest(registerSchema), register);
router.post("/login", validateRequest(loginSchema), login);
router.post("/logout", logout);

module.exports = router;
