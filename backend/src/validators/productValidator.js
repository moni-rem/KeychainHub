const { body, query } = require("express-validator");
const constants = require("../config/constants");

const productValidator = {
  createProduct: [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Product name is required")
      .isLength({ min: 3 })
      .withMessage("Product name must be at least 3 characters")
      .isLength({ max: 200 })
      .withMessage("Product name cannot exceed 200 characters"),

    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required")
      .isLength({ min: 10 })
      .withMessage("Description must be at least 10 characters")
      .isLength({ max: 2000 })
      .withMessage("Description cannot exceed 2000 characters"),

    body("price")
      .isFloat({ min: 0.01 })
      .withMessage("Price must be greater than 0")
      .custom((value) => value <= 10000)
      .withMessage("Price cannot exceed 10000"),

    body("stock")
      .isInt({ min: 0 })
      .withMessage("Stock must be a non-negative integer"),

    body("category")
      .optional()
      .trim()
      .isIn(constants.CATEGORIES)
      .withMessage(
        `Category must be one of: ${constants.CATEGORIES.join(", ")}`,
      ),

    body("isFeatured")
      .optional()
      .isBoolean()
      .withMessage("isFeatured must be a boolean"),
  ],

  updateProduct: [
    body("name")
      .optional()
      .trim()
      .isLength({ min: 3 })
      .withMessage("Product name must be at least 3 characters"),

    body("description")
      .optional()
      .trim()
      .isLength({ min: 10 })
      .withMessage("Description must be at least 10 characters"),

    body("price")
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage("Price must be greater than 0"),

    body("stock")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Stock must be a non-negative integer"),

    body("category")
      .optional()
      .trim()
      .isIn(constants.CATEGORIES)
      .withMessage(
        `Category must be one of: ${constants.CATEGORIES.join(", ")}`,
      ),

    body("isFeatured")
      .optional()
      .isBoolean()
      .withMessage("isFeatured must be a boolean"),
  ],

  productQuery: [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),

    query("limit")
      .optional()
      .isInt({ min: 1, max: constants.PAGINATION.MAX_LIMIT })
      .withMessage(
        `Limit must be between 1 and ${constants.PAGINATION.MAX_LIMIT}`,
      ),

    query("category")
      .optional()
      .trim()
      .isIn(constants.CATEGORIES)
      .withMessage(
        `Category must be one of: ${constants.CATEGORIES.join(", ")}`,
      ),

    query("minPrice")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Minimum price must be a positive number"),

    query("maxPrice")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Maximum price must be a positive number"),

    query("search")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Search query cannot exceed 100 characters"),

    query("sortBy")
      .optional()
      .isIn(["name", "price", "createdAt", "updatedAt"])
      .withMessage("Sort by must be one of: name, price, createdAt, updatedAt"),

    query("sortOrder")
      .optional()
      .isIn(["asc", "desc"])
      .withMessage("Sort order must be either asc or desc"),

    query("isFeatured")
      .optional()
      .isIn(["true", "false"])
      .withMessage("isFeatured must be either true or false"),
  ],
};

module.exports = productValidator;
