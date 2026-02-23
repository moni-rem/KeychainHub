const express = require("express");
const {
  getCategories,
  getCategoryStats,
  getCategoryProducts,
  validateCategory,
} = require("../controllers/categoryController.js");
const { authMiddleware } = require("../middleware/authMiddleware.js");

const router = express.Router();

// Public routes
router.get("/", getCategories);

router.get("/stats", getCategoryStats);

router.get("/:category/products", getCategoryProducts);

// Admin/validation route
router.post("/validate", authMiddleware, validateCategory);

module.exports = router;
