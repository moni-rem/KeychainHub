const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { auth, adminAuth, optionalAuth } = require("../middleware/auth");
const productValidator = require("../validators/productValidator");
const { validate, validateQuery } = require("../middleware/validate");
const {
  uploadProductImages,
  handleUploadError,
} = require("../middleware/upload");

// Public routes
router.get(
  "/",
  optionalAuth,
  productValidator.productQuery,
  validateQuery,
  productController.getProducts,
);

router.get("/featured", productController.getFeaturedProducts);

router.get("/search", productController.searchProducts);

router.get("/categories", productController.getCategories);

router.get("/category/:category", productController.getProductsByCategory);

router.get("/:id", productController.getProduct);

// Protected routes (admin only)
router.post(
  "/",
  adminAuth,
  uploadProductImages,
  handleUploadError,
  productValidator.createProduct,
  validate,
  productController.createProduct,
);

router.put(
  "/:id",
  adminAuth,
  uploadProductImages,
  handleUploadError,
  productValidator.updateProduct,
  validate,
  productController.updateProduct,
);

router.delete("/:id", adminAuth, productController.deleteProduct);

router.put("/:id/stock", adminAuth, productController.updateStock);

router.get("/admin/stats", adminAuth, productController.getProductStats);

module.exports = router;
