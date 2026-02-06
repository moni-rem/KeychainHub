const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const { optionalAuth, adminAuth } = require("../middleware/auth");

// Public routes
router.get("/", categoryController.getCategories);

router.get("/stats", categoryController.getCategoryStats);

router.get("/:category/products", categoryController.getCategoryProducts);

// Admin/validation route
router.post("/validate", adminAuth, categoryController.validateCategory);

module.exports = router;
