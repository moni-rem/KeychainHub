const constants = require("../config/constants");
const productService = require("../services/productService");
const ApiResponse = require("../utils/apiResponse");
const Helpers = require("../utils/helpers");

// CategoryController handles all category-related operations
// Workflow:
// 1. Validate input parameters
// 2. Call appropriate service for business logic
// 3. Handle errors with appropriate status codes
// 4. Return consistent response format with status and data/message
class CategoryController {
  // Get all available categories
  // Workflow:
  // 1. Call productService to get all categories
  // 2. Return success response with categories data
  getCategories = Helpers.asyncHandler(async (req, res) => {
    const categories = await productService.getCategories();

    const response = ApiResponse.success("Categories retrieved successfully", {
      categories,
    });
    response.send(res);
  });

  // Get products belonging to a specific category
  // Workflow:
  // 1. Extract category from params and pagination options from query
  // 2. Validate category against allowed categories
  // 3. Build query object with filters
  // 4. Call productService to get products
  // 5. Return success response with products data
  getCategoryProducts = Helpers.asyncHandler(async (req, res) => {
    const { category } = req.params;
    const {
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Validate category
    if (!constants.CATEGORIES.includes(category)) {
      const response = ApiResponse.badRequest(
        `Invalid category. Must be one of: ${constants.CATEGORIES.join(", ")}`,
      );
      return response.send(res);
    }

    // Build query for category products
    const query = {
      page,
      limit,
      category,
      sortBy,
      sortOrder,
    };

    const result = await productService.getProducts(query);

    const response = ApiResponse.success("Category products retrieved", result);
    response.send(res);
  });

  // Get statistics for all categories
  // Workflow:
  // 1. Get all available categories
  // 2. For each category, get product count
  // 3. Sort categories by product count
  // 4. Return success response with category statistics
  getCategoryStats = Helpers.asyncHandler(async (req, res) => {
    const categories = constants.CATEGORIES;
    const stats = [];

    for (const category of categories) {
      const count = await productService.getProducts({
        category,
        limit: 1,
        page: 1,
      });

      stats.push({
        name: category,
        productCount: count.pagination.total,
      });
    }

    // Sort by product count descending
    stats.sort((a, b) => b.productCount - a.productCount);

    const response = ApiResponse.success("Category statistics retrieved", {
      categories: stats,
    });
    response.send(res);
  });

  // Validate if a category is allowed
  // Workflow:
  // 1. Extract category from request body
  // 2. Validate category is provided
  // 3. Check if category exists in allowed categories
  // 4. Return success response with validation result
  validateCategory = Helpers.asyncHandler(async (req, res) => {
    const { category } = req.body;

    if (!category) {
      const response = ApiResponse.badRequest("Category is required");
      return response.send(res);
    }

    const isValid = constants.CATEGORIES.includes(category);

    const response = ApiResponse.success(
      isValid ? "Category is valid" : "Category is invalid",
      {
        isValid,
        validCategories: constants.CATEGORIES,
        ...(isValid && { category }),
      },
    );
    response.send(res);
  });
}

module.exports = new CategoryController();
