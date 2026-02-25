import { get } from "./api";

export const analyticsService = {
  // Get revenue analytics
  getRevenueAnalytics: async (params = {}) => {
    try {
      const response = await get("/analytics/revenue", { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message || "Failed to fetch revenue analytics",
      };
    }
  },

  // Get product analytics
  getProductAnalytics: async () => {
    try {
      const response = await get("/analytics/products");
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message || "Failed to fetch product analytics",
      };
    }
  },

  // Get customer analytics
  getCustomerAnalytics: async () => {
    try {
      const response = await get("/analytics/customers");
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message || "Failed to fetch customer analytics",
      };
    }
  },

  // Get sales forecast
  getSalesForecast: async () => {
    try {
      const response = await get("/analytics/forecast");
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch forecast",
      };
    }
  },

  // Get dashboard summary
  getDashboardSummary: async () => {
    try {
      const response = await get("/analytics/dashboard");
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message || "Failed to fetch dashboard summary",
      };
    }
  },
};
