const cartService = require("../services/cartService");
const ApiResponse = require("../utils/apiResponse");
const Helpers = require("../utils/helpers");

class CartController {
  getCart = Helpers.asyncHandler(async (req, res) => {
    const result = await cartService.getCart(req.user.id);

    const response = ApiResponse.success("Cart retrieved successfully", result);
    response.send(res);
  });

  addToCart = Helpers.asyncHandler(async (req, res) => {
    const { productId, quantity = 1 } = req.body;
    const result = await cartService.addToCart(
      req.user.id,
      productId,
      quantity,
    );

    const response = ApiResponse.success("Item added to cart", result);
    response.send(res);
  });

  updateCartItem = Helpers.asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const result = await cartService.updateCartItem(
      req.user.id,
      itemId,
      quantity,
    );

    const response = ApiResponse.success("Cart item updated", result);
    response.send(res);
  });

  removeFromCart = Helpers.asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    const result = await cartService.removeFromCart(req.user.id, itemId);

    const response = ApiResponse.success("Item removed from cart", result);
    response.send(res);
  });

  clearCart = Helpers.asyncHandler(async (req, res) => {
    const result = await cartService.clearCart(req.user.id);

    const response = ApiResponse.success("Cart cleared", result);
    response.send(res);
  });

  getCartItemCount = Helpers.asyncHandler(async (req, res) => {
    const count = await cartService.getCartItemCount(req.user.id);

    const response = ApiResponse.success("Cart item count retrieved", {
      count,
    });
    response.send(res);
  });

  validateCart = Helpers.asyncHandler(async (req, res) => {
    try {
      const result = await cartService.validateCartForOrder(req.user.id);

      const response = ApiResponse.success(
        "Cart is valid for checkout",
        result,
      );
      response.send(res);
    } catch (error) {
      const response = ApiResponse.error(
        error.message,
        error.statusCode || 400,
        error.data,
      );
      response.send(res);
    }
  });

  // Merge guest cart with user cart (when user logs in)
  mergeCart = Helpers.asyncHandler(async (req, res) => {
    const { guestCart } = req.body;

    if (!guestCart || !Array.isArray(guestCart.items)) {
      const response = ApiResponse.badRequest("Invalid guest cart data");
      return response.send(res);
    }

    // Merge each item from guest cart
    for (const item of guestCart.items) {
      try {
        await cartService.addToCart(req.user.id, item.productId, item.quantity);
      } catch (error) {
        // Skip items that can't be added (out of stock, etc.)
        console.warn(`Could not merge item ${item.productId}:`, error.message);
      }
    }

    const result = await cartService.getCart(req.user.id);

    const response = ApiResponse.success("Cart merged successfully", result);
    response.send(res);
  });
}

module.exports = new CartController();
