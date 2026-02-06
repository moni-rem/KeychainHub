const { query } = require("express-validator");

const userValidator = {
  userQuery: [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),

    query("limit")
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage("Limit must be between 1 and 50"),

    query("search")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Search query cannot exceed 100 characters"),

    query("sortBy")
      .optional()
      .isIn(["email", "name", "createdAt"])
      .withMessage("Sort by must be one of: email, name, createdAt"),

    query("sortOrder")
      .optional()
      .isIn(["asc", "desc"])
      .withMessage("Sort order must be either asc or desc"),
  ],
};

module.exports = userValidator;
