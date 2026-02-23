const { z } = require("zod");

// Product categories
const CATEGORIES = ["KEYCHAIN", "CUSTOM", "LUXURY", "COLLECTIBLE"];

// Pagination limits
const PAGINATION = {
  MAX_LIMIT: 100,
};

/**
 * Validation schema for creating a product
 * Validates name, description, price, stock, category, and featured status
 */
const createProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Product name is required")
    .min(3, "Product name must be at least 3 characters")
    .max(200, "Product name cannot exceed 200 characters"),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description cannot exceed 2000 characters"),
  price: z
    .number()
    .positive("Price must be greater than 0")
    .min(0.01, "Price must be at least 0.01")
    .max(10000, "Price cannot exceed 10000"),
  stock: z
    .number()
    .int("Stock must be an integer")
    .min(0, "Stock must be a non-negative integer"),
  images: z
    .array(z.string().url("Each image must be a valid URL"))
    .optional()
    .default([]),
  category: z
    .enum(CATEGORIES, {
      errorMap: () => ({
        message: `Category must be one of: ${CATEGORIES.join(", ")}`,
      }),
    })
    .optional(),
  isFeatured: z.boolean().optional(),
});

/**
 * Validation schema for updating a product
 * All fields are optional for partial updates
 */
const updateProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Product name must be at least 3 characters")
    .max(200, "Product name cannot exceed 200 characters")
    .optional(),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description cannot exceed 2000 characters")
    .optional(),
  price: z
    .number()
    .positive("Price must be greater than 0")
    .min(0.01, "Price must be at least 0.01")
    .optional(),
  stock: z
    .number()
    .int("Stock must be an integer")
    .min(0, "Stock must be a non-negative integer")
    .optional(),
  images: z.array(z.string().url("Each image must be a valid URL")).optional(),
  category: z
    .enum(CATEGORIES, {
      errorMap: () => ({
        message: `Category must be one of: ${CATEGORIES.join(", ")}`,
      }),
    })
    .optional(),
  isFeatured: z.boolean().optional(),
});

/**
 * Validation schema for product query parameters
 * Validates pagination, filtering, sorting, and search
 */
const productQuerySchema = z.object({
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
    .refine((val) => val >= 1 && val <= PAGINATION.MAX_LIMIT, {
      message: `Limit must be between 1 and ${PAGINATION.MAX_LIMIT}`,
    }),
  category: z
    .enum(CATEGORIES, {
      errorMap: () => ({
        message: `Category must be one of: ${CATEGORIES.join(", ")}`,
      }),
    })
    .optional(),
  minPrice: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined))
    .refine((val) => val === undefined || val >= 0, {
      message: "Minimum price must be a positive number",
    }),
  maxPrice: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined))
    .refine((val) => val === undefined || val >= 0, {
      message: "Maximum price must be a positive number",
    }),
  search: z
    .string()
    .trim()
    .max(100, "Search query cannot exceed 100 characters")
    .optional(),
  sortBy: z
    .enum(["name", "price", "createdAt", "updatedAt"], {
      errorMap: () => ({
        message: "Sort by must be one of: name, price, createdAt, updatedAt",
      }),
    })
    .optional(),
  sortOrder: z
    .enum(["asc", "desc"], {
      errorMap: () => ({
        message: "Sort order must be either asc or desc",
      }),
    })
    .optional(),
  isFeatured: z
    .string()
    .optional()
    .transform((val) => val === "true")
    .optional(),
});

module.exports = {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
  CATEGORIES,
  PAGINATION,
};
