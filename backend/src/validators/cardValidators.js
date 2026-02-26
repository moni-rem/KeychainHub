const { z } = require("zod");

const addToCartSchema = z.object({
  productId: z.string().uuid("Invalid product ID format"),
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1")
    .max(99, "Quantity cannot exceed 99")
    .optional()
    .default(1),
});

const updateCartItemSchema = z.object({
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1")
    .max(99, "Quantity cannot exceed 99"),
});

module.exports = { addToCartSchema, updateCartItemSchema };
