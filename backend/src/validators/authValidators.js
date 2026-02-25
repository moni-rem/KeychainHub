const { z } = require("zod");

/**
 * Validation schema for user registration
 * Validates name, email format, and password strength
 */
const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please provide a valid email")
    .toLowerCase(),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters")
    .max(50, "Password cannot exceed 50 characters"),
  phone: z
    .string()
    .trim()
    .min(10, "Phone number must be at least 10 characters")
    .optional(),
  address: z
    .string()
    .trim()
    .max(500, "Address cannot exceed 500 characters")
    .optional(),
});

/**
 * Validation schema for user login
 * Validates email format and ensures password is provided
 */
const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please provide a valid email")
    .toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

/**
 * Validation schema for user profile update
 * Validates optional fields for profile updates
 */
const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .optional(),
  phone: z
    .string()
    .trim()
    .min(10, "Phone number must be at least 10 characters")
    .optional(),
  address: z
    .string()
    .trim()
    .max(500, "Address cannot exceed 500 characters")
    .optional(),
});

/**
 * Validation schema for password change
 * Validates old password and new password requirements
 */
const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Old password is required"),
  newPassword: z
    .string()
    .min(6, "New password must be at least 6 characters")
    .max(50, "New password cannot exceed 50 characters"),
});

/**
 * Validation schema for making a user admin
 * Validates email format for admin elevation
 */
const makeAdminSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please provide a valid email")
    .toLowerCase(),
});

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  makeAdminSchema, // Added this
};
