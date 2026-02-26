const express = require("express");

console.log("=== DEBUGGING IMPORTS ===");

// Check controller imports
const controller = require("../controllers/productController");
console.log("Controller:", Object.keys(controller));

// Check each controller function
console.log("getAllProducts:", typeof controller.getAllProducts);
console.log("getProductById:", typeof controller.getProductById);
console.log("createProduct:", typeof controller.createProduct);
console.log("updateProduct:", typeof controller.updateProduct);
console.log("deleteProduct:", typeof controller.deleteProduct);
console.log("getFeaturedProducts:", typeof controller.getFeaturedProducts);
console.log("getProductsByCategory:", typeof controller.getProductsByCategory);

// Check middleware imports
try {
  const validateRequest = require("../middleware/validateRequest");
  console.log("validateRequest:", typeof validateRequest);
  console.log(
    "validateRequest.validateRequest:",
    typeof validateRequest.validateRequest,
  );
} catch (e) {
  console.log("validateRequest error:", e.message);
}

try {
  const validateQuery = require("../middleware/validateQuery");
  console.log("validateQuery:", typeof validateQuery);
  console.log(
    "validateQuery.validateQuery:",
    typeof validateQuery.validateQuery,
  );
} catch (e) {
  console.log("validateQuery error:", e.message);
}

try {
  const auth = require("../middleware/authMiddleware");
  console.log("authMiddleware:", typeof auth);
  console.log("authMiddleware.authMiddleware:", typeof auth.authMiddleware);
  console.log("authMiddleware.adminMiddleware:", typeof auth.adminMiddleware);
} catch (e) {
  console.log("authMiddleware error:", e.message);
}

// Check validators
try {
  const validators = require("../validators/productValidator");
  console.log("Validators:", Object.keys(validators));
} catch (e) {
  console.log("Validators error:", e.message);
}

console.log("=== END DEBUG ===");
