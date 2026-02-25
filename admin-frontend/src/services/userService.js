import { get, post, put, del } from "./api";

class UserService {
  transformUser(user) {
    if (!user) return null;

    const role = user.role || (user.isAdmin ? "admin" : "customer");
    const status =
      user.status || (user.isActive === false ? "inactive" : "active");
    const joinDate = user.joinDate || user.createdAt;
    const orders =
      typeof user.orders === "number"
        ? user.orders
        : user._count?.orders || user.orders?.length || 0;
    const location =
      user.location ||
      (typeof user.address === "string"
        ? user.address.split(",").pop()?.trim() || ""
        : "");

    return {
      id: user.id,
      name: user.name || "Unknown",
      email: user.email || "",
      phone: user.phone || "",
      role,
      status,
      joinDate,
      orders,
      totalSpent: user.totalSpent || 0,
      location,
      avatar: user.avatar || null,
      address: user.address || "",
      recentOrders: user.recentOrders || [],
    };
  }

  extractList(response) {
    const payload = response?.data || {};
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.users)) return payload.users;
    if (Array.isArray(response?.data)) return response.data;
    return [];
  }

  extractPagination(response, fallbackTotal = 0) {
    const payload = response?.data || {};
    return (
      payload.pagination ||
      response?.pagination || {
        page: 1,
        limit: 10,
        total: fallbackTotal,
        pages: Math.ceil(fallbackTotal / 10),
      }
    );
  }

  async getUsers(params = {}) {
    try {
      const formattedParams = {};
      if (params.page) formattedParams.page = String(params.page);
      if (params.limit) formattedParams.limit = String(params.limit);
      if (params.search) formattedParams.search = params.search;
      if (params.role) formattedParams.role = params.role;

      const response = await get("/users", { params: formattedParams });
      let users = this.extractList(response).map((user) =>
        this.transformUser(user),
      );

      // Backend schema currently has no persisted inactive status.
      if (params.status && params.status !== "all") {
        users = users.filter((user) => user.status === params.status);
      }

      return {
        success: true,
        data: users,
        pagination: this.extractPagination(response, users.length),
      };
    } catch (error) {
      console.error("❌ Error fetching users:", error);
      return {
        success: false,
        error: error.message || "Failed to fetch users",
        data: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 },
      };
    }
  }

  async getUser(id) {
    try {
      const response = await get(`/users/${id}`);
      const rawUser = response?.data?.user || response?.data || response;

      return {
        success: true,
        data: this.transformUser(rawUser),
      };
    } catch (error) {
      console.error("❌ Error fetching user:", error);
      return {
        success: false,
        error: error.message || "User not found",
      };
    }
  }

  async createUser(userData) {
    try {
      const payload = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        phone: userData.phone || "",
        address: userData.address || "",
        isAdmin: userData.role === "admin",
      };

      const response = await post("/users", payload);
      return {
        success: true,
        data: this.transformUser(response?.data?.user || response?.data),
        message: response.message || "User created successfully",
      };
    } catch (error) {
      console.error("❌ Error creating user:", error);
      return {
        success: false,
        error: error.message || "Failed to create user",
      };
    }
  }

  async updateUser(id, userData) {
    try {
      const payload = {};

      if (userData.name) payload.name = userData.name;
      if (userData.email) payload.email = userData.email;
      if (userData.phone !== undefined) payload.phone = userData.phone;
      if (userData.address !== undefined) payload.address = userData.address;
      if (userData.role !== undefined) {
        payload.isAdmin = userData.role === "admin";
      }

      const response = await put(`/users/${id}`, payload);
      return {
        success: true,
        data: this.transformUser(response?.data?.user || response?.data),
        message: response.message || "User updated successfully",
      };
    } catch (error) {
      console.error("❌ Error updating user:", error);
      return {
        success: false,
        error: error.message || "Failed to update user",
      };
    }
  }

  async deleteUser(id) {
    try {
      const response = await del(`/users/${id}`);
      return {
        success: true,
        message: response.message || "User deleted successfully",
      };
    } catch (error) {
      console.error("❌ Error deleting user:", error);
      return {
        success: false,
        error: error.message || "Failed to delete user",
      };
    }
  }

  async getUserStats() {
    try {
      const response = await get("/users/stats");
      return {
        success: true,
        data: response.data || response,
      };
    } catch (error) {
      console.error("❌ Error fetching user stats:", error);
      return {
        success: false,
        error: error.message || "Failed to fetch stats",
      };
    }
  }

  async getUserActivity(userId, limit = 50) {
    try {
      const response = await get(`/users/${userId}/activity`, {
        params: { limit: String(limit) },
      });
      return {
        success: true,
        data: response.data?.activity || response.data || [],
      };
    } catch (error) {
      console.error("❌ Error fetching user activity:", error);
      return {
        success: false,
        error: error.message || "Failed to fetch activity",
        data: [],
      };
    }
  }

  async searchUsers(query) {
    try {
      const response = await get("/users/search", {
        params: { q: query },
      });
      return {
        success: true,
        data: response.data?.users || response.data || [],
      };
    } catch (error) {
      console.error("❌ Error searching users:", error);
      return {
        success: false,
        error: error.message || "Failed to search users",
        data: [],
      };
    }
  }

  async getCustomers(params = {}) {
    try {
      const response = await get("/users/customers", { params });
      const list = this.extractList(response).map((user) =>
        this.transformUser(user),
      );

      return {
        success: true,
        data: list,
        pagination: this.extractPagination(response, list.length),
      };
    } catch (error) {
      console.error("❌ Error fetching customers:", error);
      return {
        success: false,
        error: error.message || "Failed to fetch customers",
        data: [],
      };
    }
  }
}

const userService = new UserService();
export default userService;
