import { get, put } from "./api";

class OrderService {
  transformOrder(order) {
    const safeId = order?.id !== undefined && order?.id !== null
      ? String(order.id)
      : "";

    return {
      id: order.id,
      orderNumber: order.orderNumber || (safeId ? `ORD-${safeId.slice(0, 8)}` : "N/A"),
      customer: {
        name: order.user?.name || "Unknown",
        email: order.user?.email || "",
        id: order.user?.id || "",
      },
      date: order.createdAt,
      createdAt: order.createdAt,
      total: Number(order.total ?? order.amount ?? 0),
      status: order.status || "pending",
      items: order.items || [],
      itemsCount: order.items?.length || 0,
      payment:
        order.paymentMethod || order.payment_method || "N/A",
      paymentMethod:
        order.paymentMethod || order.payment_method || "N/A",
      shipping: order.shippingMethod || "Standard",
    };
  }

  async getOrders(params = {}) {
    try {
      const formattedParams = {};
      if (params.page) formattedParams.page = String(params.page);
      if (params.limit) formattedParams.limit = String(params.limit);
      if (params.status) formattedParams.status = params.status;
      if (params.startDate) formattedParams.startDate = params.startDate;
      if (params.endDate) formattedParams.endDate = params.endDate;
      if (params.userId) formattedParams.limit = "200";

      const response = await get("/admin/orders", { params: formattedParams });
      let rows = response.data?.data || response.data || [];
      const pagination = response.data?.pagination || response.pagination || null;

      if (!Array.isArray(rows)) rows = [];

      // Backend admin order endpoint currently has no search/userId filtering.
      if (params.userId) {
        rows = rows.filter((order) => order.user?.id === params.userId);
      }
      if (params.search) {
        const query = String(params.search).trim().toLowerCase();
        rows = rows.filter((order) => {
          const orderId = String(order.id ?? "").toLowerCase();
          const name = order.user?.name?.toLowerCase() || "";
          const email = order.user?.email?.toLowerCase() || "";
          return (
            orderId.includes(query) || name.includes(query) || email.includes(query)
          );
        });
      }

      const transformedOrders = rows.map((order) => this.transformOrder(order));

      return {
        success: true,
        data: transformedOrders,
        pagination: pagination || {
          page: 1,
          limit: 10,
          total: transformedOrders.length,
          pages: Math.ceil(transformedOrders.length / 10),
        },
      };
    } catch (error) {
      console.error("❌ Error fetching orders:", error);
      return {
        success: false,
        error: error.message || "Failed to fetch orders",
        data: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 },
      };
    }
  }

  async getAllOrders(params = {}) {
    return this.getOrders(params);
  }

  async updateOrderStatus(id, status) {
    try {
      const response = await put(`/admin/orders/${id}/status`, { status });
      return {
        success: true,
        data: response.data?.order || response.data,
        message: response.message || "Order status updated",
      };
    } catch (error) {
      console.error("❌ Error updating order status:", error);
      return {
        success: false,
        error: error.message || "Failed to update order status",
      };
    }
  }

  async getOrderStats(timeRange = "month") {
    try {
      const dashboard = await get("/admin/dashboard", {
        params: { timeRange },
      });

      const stats = dashboard?.orderStats || {};
      return {
        success: true,
        data: {
          totalOrders: stats.totalOrders || 0,
          pendingOrders: stats.pendingOrders || 0,
          processingOrders: stats.processingOrders || 0,
          completedOrders: stats.completedOrders || 0,
          cancelledOrders:
            stats.cancelledOrders ||
            Math.max(
              0,
              (stats.totalOrders || 0) -
                (stats.pendingOrders || 0) -
                (stats.completedOrders || 0) -
                (stats.processingOrders || 0),
            ),
          totalRevenue: stats.totalRevenue || 0,
          avgOrderValue:
            stats.totalOrders > 0
              ? Number(stats.averageOrderValue || 0)
              : Number(stats.averageOrderValue || 0),
          recentOrders: stats.recentOrders || [],
          topProducts: (stats.topProducts || []).map((item) => ({
            ...item,
            name: item.productName || item.name || "Unknown",
          })),
        },
      };
    } catch (error) {
      console.error("❌ Error fetching order stats:", error);
      return {
        success: false,
        error: error.message || "Failed to fetch stats",
        data: {
          totalOrders: 0,
          pendingOrders: 0,
          processingOrders: 0,
          completedOrders: 0,
          cancelledOrders: 0,
          totalRevenue: 0,
          avgOrderValue: 0,
          recentOrders: [],
          topProducts: [],
        },
      };
    }
  }

  async getDashboardStats(timeRange = "month") {
    try {
      const dashboard = await get("/admin/dashboard", {
        params: { timeRange },
      });
      return {
        success: true,
        data: dashboard || {},
      };
    } catch (error) {
      console.error("❌ Error fetching dashboard stats:", error);
      return {
        success: false,
        error: error.message || "Failed to fetch dashboard stats",
      };
    }
  }

  async getRevenueAnalytics(startDate, endDate) {
    try {
      const analytics = await get("/admin/analytics", {
        params: { startDate, endDate },
      });
      return {
        success: true,
        data: analytics || {},
      };
    } catch (error) {
      console.error("❌ Error fetching revenue analytics:", error);
      return {
        success: false,
        error: error.message || "Failed to fetch analytics",
      };
    }
  }

  async getSystemStats() {
    try {
      const systemStats = await get("/admin/system-stats");
      return {
        success: true,
        data: systemStats || {},
      };
    } catch (error) {
      console.error("❌ Error fetching system stats:", error);
      return {
        success: false,
        error: error.message || "Failed to fetch system stats",
        data: {},
      };
    }
  }
}

const orderService = new OrderService();
export default orderService;
