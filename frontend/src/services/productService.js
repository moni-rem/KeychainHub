import api from "../api/axios";

const productService = {
  // Get all products
  getAllProducts: async (params = {}) => {
    try {
      const response = await api.get("/products", { params });
      return response;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  // Get single product
  getProduct: async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response;
    } catch (error) {
      console.error("Error fetching product:", error);
      throw error;
    }
  },

  // Get featured products
  getFeaturedProducts: async (limit = 6) => {
    try {
      const response = await api.get("/products/featured", {
        params: { limit },
      });
      return response;
    } catch (error) {
      console.error("Error fetching featured products:", error);
      throw error;
    }
  },

  // Get products by category
  getProductsByCategory: async (category, params = {}) => {
    try {
      const response = await api.get(`/products/category/${category}`, {
        params,
      });
      return response;
    } catch (error) {
      console.error("Error fetching products by category:", error);
      throw error;
    }
  },
};

export default productService;
