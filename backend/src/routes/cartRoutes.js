const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { auth } = require("../middleware/auth");

// All cart routes require authentication
router.use(auth);

// Get cart and item count
router.get("/", cartController.getCart);

router.get("/count", cartController.getCartItemCount);

// Cart operations
router.post("/", cartController.addToCart);

router.put("/:itemId", cartController.updateCartItem);

router.delete("/:itemId", cartController.removeFromCart);

router.delete("/", cartController.clearCart);

// Cart validation
router.get("/validate", cartController.validateCart);

// Cart merging (for guest users who log in)
router.post("/merge", cartController.mergeCart);

module.exports = router;
