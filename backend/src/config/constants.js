module.exports = {
  // Order status
  ORDER_STATUS: {
    PENDING: "pending",
    PROCESSING: "processing",
    SHIPPED: "shipped",
    DELIVERED: "delivered",
    CANCELLED: "cancelled",
  },

  // Payment status
  PAYMENT_STATUS: {
    PENDING: "pending",
    PAID: "paid",
    FAILED: "failed",
    REFUNDED: "refunded",
  },

  // User roles
  USER_ROLES: {
    USER: "user",
    ADMIN: "admin",
  },

  // Product categories
  CATEGORIES: [
    "Anime",
    "Games",
    "Movies",
    "Custom",
    "Animals",
    "Sports",
    "Music",
    "Cartoon",
    "Fantasy",
    "Sci-Fi",
  ],

  // Pagination defaults
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },

  // File upload limits
  UPLOAD_LIMITS: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    MAX_FILES: 5,
  },

  // Validation messages
  VALIDATION_MESSAGES: {
    REQUIRED: "This field is required",
    INVALID_EMAIL: "Please enter a valid email address",
    PASSWORD_MIN: "Password must be at least 6 characters",
    PASSWORD_MAX: "Password cannot exceed 50 characters",
  },
};
