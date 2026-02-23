const express = require("express");
const {
  getAllKeychains,
  getKeychainById,
  createKeychain,
  updateKeychain,
  deleteKeychain,
  getFeaturedKeychains,
  getKeychainsByCategory,
} = require("../controllers/productController.js");
const { validateRequest } = require("../middleware/validateRequest.js");
const { validateQuery } = require("../middleware/validateQuery.js");
const {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
} = require("../validators/productValidator.js");
const { authMiddleware } = require("../middleware/authMiddleware.js");

const router = express.Router();

// Public routes
router.get("/", validateQuery(productQuerySchema), getAllKeychains);
router.get("/featured", getFeaturedKeychains);
router.get("/category/:category", getKeychainsByCategory);
router.get("/:id", getKeychainById);

// Admin only routes
router.post(
  "/",
  authMiddleware,
  validateRequest(createProductSchema),
  createKeychain,
);
router.put(
  "/:id",
  authMiddleware,
  validateRequest(updateProductSchema),
  updateKeychain,
);
router.delete("/:id", authMiddleware, deleteKeychain);

module.exports = router;
