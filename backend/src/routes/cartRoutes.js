const express = require("express");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartCount,
} = require("../controllers/cartController.js");
const { validateRequest } = require("../middleware/validateRequest.js");
const {
  addToCartSchema,
  updateCartItemSchema,
} = require("../validators/cartValidators.js");
const { authMiddleware } = require("../middleware/authMiddleware.js");

const router = express.Router();

// All cart routes require authentication
router.use(authMiddleware);

router.get("/", getCart);
router.get("/count", getCartCount);
router.post("/", validateRequest(addToCartSchema), addToCart);
router.put("/:itemId", validateRequest(updateCartItemSchema), updateCartItem);
router.delete("/:itemId", removeFromCart);
router.delete("/", clearCart);

module.exports = router;
