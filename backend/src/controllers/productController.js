const productService = require("../services/productService");
const ApiResponse = require("../utils/apiResponse");
const Helpers = require("../utils/helpers");

class ProductController {
  createProduct = Helpers.asyncHandler(async (req, res) => {
    const productData = req.body;
    const images = req.files || [];

    const product = await productService.createProduct(productData, images);

    const response = ApiResponse.created("Product created successfully", {
      product,
    });
    response.send(res);
  });

  getProducts = Helpers.asyncHandler(async (req, res) => {
    const result = await productService.getProducts(req.query);

    const response = ApiResponse.success(
      "Products retrieved successfully",
      result,
    );
    response.send(res);
  });

  getProduct = Helpers.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const product = await productService.getProductById(id);

    const response = ApiResponse.success("Product retrieved successfully", {
      product,
    });
    response.send(res);
  });

  updateProduct = Helpers.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const images = req.files || [];

    const product = await productService.updateProduct(id, updateData, images);

    const response = ApiResponse.success("Product updated successfully", {
      product,
    });
    response.send(res);
  });

  deleteProduct = Helpers.asyncHandler(async (req, res) => {
    const { id } = req.params;
    await productService.deleteProduct(id);

    const response = ApiResponse.success("Product deleted successfully");
    response.send(res);
  });

  getFeaturedProducts = Helpers.asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 8;
    const products = await productService.getFeaturedProducts(limit);

    const response = ApiResponse.success("Featured products retrieved", {
      products,
    });
    response.send(res);
  });

  getProductsByCategory = Helpers.asyncHandler(async (req, res) => {
    const { category } = req.params;
    const limit = parseInt(req.query.limit) || 20;

    const products = await productService.getProductsByCategory(
      category,
      limit,
    );

    const response = ApiResponse.success("Products retrieved by category", {
      products,
    });
    response.send(res);
  });

  searchProducts = Helpers.asyncHandler(async (req, res) => {
    const { q } = req.query;
    const filters = req.query;

    if (!q) {
      const response = ApiResponse.badRequest("Search query is required");
      return response.send(res);
    }

    const products = await productService.searchProducts(q, filters);

    const response = ApiResponse.success("Search results", { products });
    response.send(res);
  });

  getProductStats = Helpers.asyncHandler(async (req, res) => {
    const stats = await productService.getProductStats();

    const response = ApiResponse.success("Product statistics retrieved", stats);
    response.send(res);
  });

  getCategories = Helpers.asyncHandler(async (req, res) => {
    const categories = await productService.getCategories();

    const response = ApiResponse.success("Categories retrieved", {
      categories,
    });
    response.send(res);
  });

  updateStock = Helpers.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;

    const product = await productService.updateStock(id, quantity);

    const response = ApiResponse.success("Stock updated successfully", {
      product,
    });
    response.send(res);
  });
}

module.exports = new ProductController();
