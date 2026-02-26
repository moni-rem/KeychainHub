const { z } = require("zod");

/**
 * Validation schema for adding an item to cart
 * Validates productId and quantity
 */
const addToCartSchema = z.object({
  productId: z
    .string()
    .min(1, "Product ID is required")
    .uuid("Invalid product ID format"),
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1")
    .max(100, "Quantity cannot exceed 100")
    .optional()
    .default(1),
});

/**
 * Validation schema for updating a cart item
 * Validates quantity
 */
const updateCartItemSchema = z.object({
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1")
    .max(100, "Quantity cannot exceed 100"),
});

module.exports = {
  addToCartSchema,
  updateCartItemSchema,
};
