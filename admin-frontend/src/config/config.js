// admin-frontend/src/config/config.js
const config = {
  // API Configuration
  api: {
    baseURL: process.env.REACT_APP_API_URL || "http://localhost:3000/api",
    timeout: 30000,
    uploadEndpoint: "/upload",
    productsEndpoint: "/products",
    authEndpoint: "/auth",
  },

  // Product Configuration
  products: {
    defaultCategories: [
      "Plastic Keychains",
      "Leather Keychains",
      "Metal Keychains",
      "Rubber Keychains",
      "Novelty Keychains",
      "Straps",
      "Uncategorized",
    ],
    imageFormats: ["image/jpeg", "image/jpg", "image/png", "image/gif"],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    defaultImage:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop",
  },

  // App Configuration
  app: {
    name: "KeyCraft Admin",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    debug: process.env.REACT_APP_DEBUG === "true",
  },

  // Storage Configuration
  storage: {
    authTokenKey: "authToken",
    userKey: "user",
    themeKey: "theme",
  },

  // Pagination Configuration
  pagination: {
    defaultPageSize: 10,
    pageSizes: [10, 25, 50, 100],
  },

  // Feature Flags
  features: {
    enableImageUpload: true,
    enableBulkActions: true,
    enableExport: true,
    enableNotifications: true,
  },

  // Validation Rules
  validation: {
    productName: {
      minLength: 2,
      maxLength: 100,
    },
    productDescription: {
      maxLength: 1000,
    },
    productPrice: {
      min: 0,
      max: 999999.99,
    },
    productStock: {
      min: 0,
      max: 999999,
    },
  },
};

// Helper functions
export const getApiUrl = (endpoint = "") => `${config.api.baseURL}${endpoint}`;
export const getAuthHeaders = () => {
  const token = localStorage.getItem(config.storage.authTokenKey);
  return token ? { Authorization: `Bearer ${token}` } : {};
};
export const isDevelopment = () => config.app.environment === "development";

export default config;
