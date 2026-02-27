// src/services/api.js
import axios from "axios";
import toast from "react-hot-toast";

export const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    // Try to get token from multiple possible keys
    const token =
      localStorage.getItem("adminToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("jwt");

    console.log("🔑 Auth Token present:", !!token); // Debug log

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("📤 Request with token:", config.url); // Debug log
    } else {
      console.warn("⚠️ No auth token found for request:", config.url);
    }

    // Log requests in development
    if (process.env.NODE_ENV === "development") {
      console.log(`📤 ${config.method.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
        hasToken: !!token,
      });
    }

    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  },
);

// Response interceptor - handle responses and errors
api.interceptors.response.use(
  (response) => {
    // Log responses in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `📥 ${response.config.method.toUpperCase()} ${response.config.url}`,
        {
          status: response.status,
          data: response.data,
        },
      );
    }

    // Handle different response formats from backend
    const res = response.data;

    // Format 1: { success: true, data: {...}, message: "..." }
    if (res && res.success === true) {
      return {
        success: true,
        data: res.data || null,
        message: res.message || "Success",
        pagination: res.pagination || null,
      };
    }

    // Format 2: { status: "success", data: {...} }
    if (res && res.status === "success") {
      return {
        success: true,
        data: res.data || null,
        message: res.message || "Success",
        pagination: res.pagination || null,
      };
    }

    // Format 3: Direct data return
    if (res && (res.data || res.pagination || Array.isArray(res))) {
      return {
        success: true,
        data: res.data || res,
        pagination: res.pagination || null,
        message: res.message || "Success",
      };
    }

    // Return as is if no specific format
    return {
      success: true,
      data: res,
      message: "Success",
    };
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error("🌐 Network Error:", error.message);
      toast.error("Network error. Please check your connection.");
      return Promise.reject({
        success: false,
        message: "Network error. Please check your connection.",
        status: 503,
      });
    }

    // Handle HTTP errors
    const { status, data, config } = error.response;

    // Log errors in development
    console.error(`❌ ${config?.method?.toUpperCase()} ${config?.url}`, {
      status,
      data,
      headers: config?.headers,
    });

    // Extract error message from various formats
    let message = "An error occurred";
    if (data?.message) message = data.message;
    else if (data?.error) message = data.error;
    else if (data?.msg) message = data.msg;
    else if (typeof data === "string") message = data;

    // Handle 401 Unauthorized - but don't redirect immediately
    if (status === 401) {
      console.warn("🔒 Unauthorized access - token may be expired");

      // Check if this is a login request (don't redirect for login failures)
      const isLoginRequest = config?.url?.includes("/login");

      if (!isLoginRequest) {
        // Clear invalid tokens
        localStorage.removeItem("adminToken");
        localStorage.removeItem("token");
        localStorage.removeItem("jwt");
        localStorage.removeItem("adminUser");
        localStorage.removeItem("user");
        localStorage.removeItem("isAuthenticated");

        // Redirect to login for a consistent expired-session experience.
        if (typeof window !== "undefined") {
          window.location.replace("/login");
        }
      }
    }

    return Promise.reject({
      success: false,
      message,
      status,
      data: data || null,
    });
  },
);

// Helper functions for common HTTP methods
export const get = async (url, config = {}) => {
  try {
    const response = await api.get(url, config);
    return response.data;
  } catch (error) {
    throw error.success === false
      ? error
      : { success: false, message: error.message };
  }
};

export const post = async (url, data, config = {}) => {
  try {
    const response = await api.post(url, data, config);
    return response.data;
  } catch (error) {
    throw error.success === false
      ? error
      : { success: false, message: error.message };
  }
};

export const put = async (url, data, config = {}) => {
  try {
    const response = await api.put(url, data, config);
    return response.data;
  } catch (error) {
    throw error.success === false
      ? error
      : { success: false, message: error.message };
  }
};

export const del = async (url, config = {}) => {
  try {
    const response = await api.delete(url, config);
    return response.data;
  } catch (error) {
    throw error.success === false
      ? error
      : { success: false, message: error.message };
  }
};

export const upload = async (url, file, data = {}, config = {}) => {
  const formData = new FormData();
  formData.append("file", file);

  // Add any additional data
  Object.keys(data).forEach((key) => {
    formData.append(key, data[key]);
  });

  try {
    const response = await api.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      ...config,
    });
    return response.data;
  } catch (error) {
    throw error.success === false
      ? error
      : { success: false, message: error.message };
  }
};

export default api;
