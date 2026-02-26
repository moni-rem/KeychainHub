const express = require("express");
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getProductsByCategory,
} = require("../controllers/productController");
const { validateRequest } = require("../middleware/validateRequest");
const { validateQuery } = require("../middleware/validateQuery");
const {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
} = require("../validators/productValidator");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware"); // Only import authMiddleware for now

const router = express.Router();

// Public routes
router.get("/", validateQuery(productQuerySchema), getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/:id", getProductById);

// Admin only routes - temporarily without adminMiddleware
router.post(
  "/",
  authMiddleware, // Make sure this is here
  adminMiddleware, // Make sure this is here
  validateRequest(createProductSchema),
  createProduct,
);
router.put(
  "/:id",
  authMiddleware, // Keep auth check, remove admin check for now
  validateRequest(updateProductSchema),
  updateProduct,
);
router.delete(
  "/:id",
  authMiddleware, // Keep auth check, remove admin check for now
  deleteProduct,
);

module.exports = router;
