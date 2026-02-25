import { get, post } from "./api";

export const authService = {
  isAuthenticated: () => {
    const token =
      localStorage.getItem("adminToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("jwt");
    const userStr = localStorage.getItem("adminUser");

    if (!token || !userStr) return false;

    try {
      const user = JSON.parse(userStr);
      return user?.isAdmin === true;
    } catch {
      return false;
    }
  },

  getToken: () =>
    localStorage.getItem("adminToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("jwt"),

  getUser: () => {
    const userStr = localStorage.getItem("adminUser");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  login: async (email, password) => {
    try {
      const response = await post("/admin/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      const payload =
        response?.token && response?.user ? response : response?.data || {};
      const token = payload?.token;
      const user = payload?.user;

      if (!token || !user?.isAdmin) {
        return {
          success: false,
          error: "Invalid admin credentials",
        };
      }

      localStorage.setItem("adminToken", token);
      localStorage.setItem("token", token);
      localStorage.setItem("jwt", token);
      localStorage.setItem("adminUser", JSON.stringify(user));
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("isAuthenticated", "true");

      return {
        success: true,
        data: { user, token },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Login failed",
      };
    }
  },

  logout: async () => {
    try {
      await post("/admin/logout", {});
    } catch {
      // continue with local logout even if request fails
    }

    localStorage.removeItem("adminToken");
    localStorage.removeItem("token");
    localStorage.removeItem("jwt");
    localStorage.removeItem("adminUser");
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
  },

  getProfile: async () => {
    try {
      const response = await get("/admin/profile");
      const user = response?.user || response?.data?.user || response?.data || null;
      return { success: true, data: user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};
