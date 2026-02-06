const { body, query } = require("express-validator");
const constants = require("../config/constants");

const orderValidator = {
  createOrder: [
    body("address")
      .trim()
      .notEmpty()
      .withMessage("Address is required")
      .isLength({ min: 10 })
      .withMessage("Address must be at least 10 characters")
      .isLength({ max: 500 })
      .withMessage("Address cannot exceed 500 characters"),

    body("phone")
      .trim()
      .notEmpty()
      .withMessage("Phone number is required")
      .isLength({ min: 10 })
      .withMessage("Phone number must be at least 10 characters")
      .isLength({ max: 20 })
      .withMessage("Phone number cannot exceed 20 characters"),

    body("notes")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Notes cannot exceed 500 characters"),
  ],

  updateOrderStatus: [
    body("status")
      .isIn(Object.values(constants.ORDER_STATUS))
      .withMessage(
        `Status must be one of: ${Object.values(constants.ORDER_STATUS).join(", ")}`,
      ),
  ],

  orderQuery: [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),

    query("limit")
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage("Limit must be between 1 and 50"),

    query("status")
      .optional()
      .isIn(Object.values(constants.ORDER_STATUS))
      .withMessage(
        `Status must be one of: ${Object.values(constants.ORDER_STATUS).join(", ")}`,
      ),

    query("startDate")
      .optional()
      .isISO8601()
      .withMessage("Start date must be a valid date"),

    query("endDate")
      .optional()
      .isISO8601()
      .withMessage("End date must be a valid date"),
  ],
};

module.exports = orderValidator;
