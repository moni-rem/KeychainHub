import axios from "axios";

// Use port 5001 for backend API
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log in development
    if (process.env.NODE_ENV === "development") {
      console.log(`🚀 ${config.method.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Handle both response formats
    if (response.data && response.data.success !== undefined) {
      return response.data;
    }
    return response.data;
  },
  (error) => {
    if (error.code === "ECONNREFUSED") {
      console.error(
        "❌ Cannot connect to backend. Make sure it's running on port 5001",
      );
    } else {
      console.error("API Error:", error.response?.status, error.message);
      if (error.response?.status === 401) {
        const isAuthRequest = ["/auth/login", "/auth/register"].some((path) =>
          error.config?.url?.includes(path),
        );
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("jwt");
        if (!isAuthRequest && typeof window !== "undefined") {
          window.location.replace("/login");
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;
