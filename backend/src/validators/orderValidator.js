const { z } = require("zod");

// Order status enum values
const ORDER_STATUS = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
};

/**
 * Validation schema for creating an order
 * Validates address, phone, and optional notes
 */
const createOrderSchema = z.object({
  address: z
    .string()
    .trim()
    .min(1, "Address is required")
    .min(10, "Address must be at least 10 characters")
    .max(500, "Address cannot exceed 500 characters"),
  phone: z
    .string()
    .trim()
    .min(1, "Phone number is required")
    .min(10, "Phone number must be at least 10 characters")
    .max(20, "Phone number cannot exceed 20 characters"),
  notes: z
    .string()
    .trim()
    .max(500, "Notes cannot exceed 500 characters")
    .optional(),
});

/**
 * Validation schema for updating order status
 * Validates status against allowed values
 */
const updateOrderStatusSchema = z.object({
  status: z.enum(Object.values(ORDER_STATUS), {
    errorMap: () => ({
      message: `Status must be one of: ${Object.values(ORDER_STATUS).join(", ")}`,
    }),
  }),
});

/**
 * Validation schema for order query parameters
 * Validates pagination, status filtering, and date range
 */
const orderQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 1))
    .refine((val) => val >= 1, {
      message: "Page must be a positive integer",
    }),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 10))
    .refine((val) => val >= 1 && val <= 50, {
      message: "Limit must be between 1 and 50",
    }),
  status: z
    .enum(Object.values(ORDER_STATUS), {
      errorMap: () => ({
        message: `Status must be one of: ${Object.values(ORDER_STATUS).join(", ")}`,
      }),
    })
    .optional(),
  startDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Start date must be a valid date",
    }),
  endDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "End date must be a valid date",
    }),
});

module.exports = {
  createOrderSchema,
  updateOrderStatusSchema,
  orderQuerySchema,
  ORDER_STATUS,
};
