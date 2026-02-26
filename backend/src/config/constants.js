module.exports = {
  // User roles
  ROLES: {
    USER: "user",
    ADMIN: "admin",
  },

  // Order statuses
  ORDER_STATUS: {
    PENDING: "pending",
    PROCESSING: "processing",
    SHIPPED: "shipped",
    DELIVERED: "delivered",
    CANCELLED: "cancelled",
  },

  // Product categories
  CATEGORIES: [
    "Metal",
    "Plastic",
    "Leather",
    "Rubber",
    "Acrylic",
    "Wood",
    "Silicone",
  ],

  // Pagination defaults
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },

  // File upload
  UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_MIME_TYPES: [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ],
  },
};
