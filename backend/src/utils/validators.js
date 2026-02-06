const { z } = require("zod");

const Validators = {
  // Auth validators
  register: z.object({
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(50, "Password cannot exceed 50 characters"),
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name cannot exceed 100 characters"),
    phone: z.string().optional(),
    address: z.string().optional(),
  }),

  login: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),

  updateProfile: z.object({
    name: z.string().min(2).max(100).optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
  }),

  changePassword: z.object({
    oldPassword: z.string().min(1, "Old password is required"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters")
      .max(50, "New password cannot exceed 50 characters"),
  }),

  // Product validators
  createProduct: z.object({
    name: z
      .string()
      .min(3, "Product name must be at least 3 characters")
      .max(200, "Product name cannot exceed 200 characters"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(2000, "Description cannot exceed 2000 characters"),
    price: z
      .number()
      .positive("Price must be positive")
      .max(10000, "Price cannot exceed 10000"),
    stock: z
      .number()
      .int("Stock must be an integer")
      .nonnegative("Stock cannot be negative"),
    category: z.string().optional(),
    isFeatured: z.boolean().optional(),
  }),

  updateProduct: z.object({
    name: z.string().min(3).max(200).optional(),
    description: z.string().min(10).max(2000).optional(),
    price: z.number().positive().max(10000).optional(),
    stock: z.number().int().nonnegative().optional(),
    category: z.string().optional(),
    isFeatured: z.boolean().optional(),
  }),

  productQuery: z.object({
    page: z.string().optional().default("1"),
    limit: z.string().optional().default("10"),
    category: z.string().optional(),
    minPrice: z.string().optional(),
    maxPrice: z.string().optional(),
    search: z.string().optional(),
    sortBy: z
      .enum(["name", "price", "createdAt", "updatedAt"])
      .optional()
      .default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
    isFeatured: z.string().optional(),
  }),

  // Cart validators
  addToCart: z.object({
    productId: z.string().min(1, "Product ID is required"),
    quantity: z
      .number()
      .int("Quantity must be an integer")
      .positive("Quantity must be positive")
      .max(100, "Maximum quantity is 100"),
  }),

  updateCartItem: z.object({
    quantity: z
      .number()
      .int("Quantity must be an integer")
      .nonnegative("Quantity cannot be negative")
      .max(100, "Maximum quantity is 100"),
  }),

  // Order validators
  createOrder: z.object({
    address: z
      .string()
      .min(10, "Address must be at least 10 characters")
      .max(500, "Address cannot exceed 500 characters"),
    phone: z
      .string()
      .min(10, "Phone number must be at least 10 characters")
      .max(20, "Phone number cannot exceed 20 characters"),
    notes: z.string().max(500).optional(),
  }),

  updateOrderStatus: z.object({
    status: z.enum([
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ]),
  }),

  orderQuery: z.object({
    page: z.string().optional().default("1"),
    limit: z.string().optional().default("10"),
    status: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),

  // Admin validators
  adminQuery: z.object({
    page: z.string().optional().default("1"),
    limit: z.string().optional().default("20"),
    search: z.string().optional(),
    sortBy: z
      .enum(["email", "name", "createdAt"])
      .optional()
      .default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  }),
};

module.exports = Validators;
