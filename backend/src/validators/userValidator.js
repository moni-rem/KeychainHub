const { z } = require("zod");

/**
 * Validation schema for user query parameters
 * Validates pagination, search, and sorting options
 */
const userQuerySchema = z.object({
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
  search: z
    .string()
    .trim()
    .max(100, "Search query cannot exceed 100 characters")
    .optional(),
  sortBy: z
    .enum(["email", "name", "createdAt"], {
      errorMap: () => ({
        message: "Sort by must be one of: email, name, createdAt",
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
});

module.exports = {
  userQuerySchema,
};
