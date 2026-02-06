const constants = require("../config/constants");
const productService = require("../services/productService");
const ApiResponse = require("../utils/apiResponse");
const Helpers = require("../utils/helpers");

class CategoryController {
  getCategories = Helpers.asyncHandler(async (req, res) => {
    const categories = await productService.getCategories();

    const response = ApiResponse.success("Categories retrieved successfully", {
      categories,
    });
    response.send(res);
  });

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
