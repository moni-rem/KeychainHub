const { body } = require("express-validator");
const constants = require("../config/constants");

const authValidator = {
  register: [
    body("email")
      .isEmail()
      .withMessage(constants.VALIDATION_MESSAGES.INVALID_EMAIL)
      .normalizeEmail(),

    body("password")
      .isLength({ min: 6 })
      .withMessage(constants.VALIDATION_MESSAGES.PASSWORD_MIN)
      .isLength({ max: 50 })
      .withMessage(constants.VALIDATION_MESSAGES.PASSWORD_MAX),

    body("name")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 characters")
      .isLength({ max: 100 })
      .withMessage("Name cannot exceed 100 characters"),

    body("phone")
      .optional()
      .trim()
      .isLength({ min: 10 })
      .withMessage("Phone number must be at least 10 characters"),

    body("address")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Address cannot exceed 500 characters"),
  ],

  login: [
    body("email")
      .isEmail()
      .withMessage(constants.VALIDATION_MESSAGES.INVALID_EMAIL)
      .normalizeEmail(),

    body("password").notEmpty().withMessage("Password is required"),
  ],

  updateProfile: [
    body("name")
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 characters"),

    body("phone")
      .optional()
      .trim()
      .isLength({ min: 10 })
      .withMessage("Phone number must be at least 10 characters"),

    body("address")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Address cannot exceed 500 characters"),
  ],

  changePassword: [
    body("oldPassword").notEmpty().withMessage("Old password is required"),

    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters")
      .isLength({ max: 50 })
      .withMessage("New password cannot exceed 50 characters"),
  ],
};

module.exports = authValidator;
