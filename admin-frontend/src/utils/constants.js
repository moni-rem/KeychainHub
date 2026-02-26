// Application constants
export const APP_NAME = "KeyCraft Admin";
export const APP_VERSION = "1.0.0";
export const COPYRIGHT_YEAR = new Date().getFullYear();

// User roles
export const USER_ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  CUSTOMER: "customer",
  GUEST: "guest",
};

// Order statuses
export const ORDER_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
};

// Product statuses
export const PRODUCT_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  OUT_OF_STOCK: "out_of_stock",
  DISCONTINUED: "discontinued",
};

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
};

// Date formats
export const DATE_FORMATS = {
  DISPLAY: "MMM DD, YYYY",
  DATABASE: "YYYY-MM-DD",
  FULL: "MMMM DD, YYYY hh:mm A",
  TIME: "hh:mm A",
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  LIMIT_OPTIONS: [5, 10, 20, 50, 100],
};

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "authToken",
  USER: "user",
  THEME: "theme",
  LANGUAGE: "language",
  CART: "cart",
};

// API endpoints (for reference)
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    PROFILE: "/auth/profile",
  },
  USERS: "/users",
  ORDERS: "/orders",
  PRODUCTS: "/products",
  CATEGORIES: "/categories",
};
