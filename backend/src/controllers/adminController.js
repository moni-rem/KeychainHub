const orderService = require("../services/orderService");
const productService = require("../services/productService");
const userService = require("../services/userService");
const ApiResponse = require("../utils/apiResponse");
const Helpers = require("../utils/helpers");
const constants = require("../config/constants");

class AdminController {
  getDashboardStats = Helpers.asyncHandler(async (req, res) => {
    const { timeRange = "month" } = req.query;

    const [
      orderStats,
      productStats,
      userStats,
      recentOrders,
      lowStockProducts,
    ] = await Promise.all([
      orderService.getOrderStats(timeRange),
      productService.getProductStats(),
      userService.getUserStats(),
      orderService.getAllOrders({ limit: 5 }),
      productService.getProducts({
        limit: 5,
        stock: "low", // This would need a custom filter
      }),
    ]);

    const dashboardData = {
      overview: {
        totalRevenue: orderStats.totalRevenue,
        totalOrders: orderStats.totalOrders,
        totalProducts: productStats.totalProducts,
        totalUsers: userStats.totalUsers,
        growthRate:
          orderStats.totalOrders > 0
            ? (
                (orderStats.completedOrders / orderStats.totalOrders) *
                100
              ).toFixed(2)
            : "0.00",
      },
      orderStats,
      productStats: {
        ...productStats,
        lowStockProducts: productStats.lowStockProducts,
        outOfStockProducts: productStats.outOfStockProducts,
      },
      userStats,
      recentOrders: recentOrders.data || [],
      lowStockProducts: lowStockProducts.products || [],
      timeRange,
    };

    const response = ApiResponse.success(
      "Dashboard statistics retrieved",
      dashboardData,
    );
    response.send(res);
  });

  getSalesAnalytics = Helpers.asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      const response = ApiResponse.badRequest(
        "startDate and endDate are required",
      );
      return response.send(res);
    }

    const analytics = await orderService.getSalesAnalytics(startDate, endDate);

    const response = ApiResponse.success(
      "Sales analytics retrieved",
      analytics,
    );
    response.send(res);
  });

  updateOrderStatus = Helpers.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const order = await orderService.updateOrderStatus(id, status);

    const response = ApiResponse.success("Order status updated", { order });
    response.send(res);
  });

  getAllOrders = Helpers.asyncHandler(async (req, res) => {
    const result = await orderService.getAllOrders(req.query);

    const response = ApiResponse.success("All orders retrieved", result);
    response.send(res);
  });

  getAllUsers = Helpers.asyncHandler(async (req, res) => {
    const result = await userService.getUsers(req.query);

    const response = ApiResponse.success("All users retrieved", result);
    response.send(res);
  });

  getAllProducts = Helpers.asyncHandler(async (req, res) => {
    const result = await productService.getProducts(req.query);

    const response = ApiResponse.success("All products retrieved", result);
    response.send(res);
  });

  getSystemStats = Helpers.asyncHandler(async (req, res) => {
    const [
      totalOrders,
      totalRevenue,
      totalProducts,
      totalUsers,
      pendingOrders,
      lowStockCount,
    ] = await Promise.all([
      orderService.getAllOrders({ limit: 1 }).then((r) => r.pagination.total),
      orderService.getOrderStats("year").then((stats) => stats.totalRevenue),
      productService.getProductStats().then((stats) => stats.totalProducts),
      userService.getUserStats().then((stats) => stats.totalUsers),
      orderService
        .getAllOrders({ status: "pending", limit: 1 })
        .then((r) => r.pagination.total),
      productService.getProductStats().then((stats) => stats.lowStockProducts),
    ]);

    const systemStats = {
      totals: {
        orders: totalOrders,
        revenue: `$${totalRevenue}`,
        products: totalProducts,
        users: totalUsers,
      },
      pending: {
        orders: pendingOrders,
        lowStock: lowStockCount,
      },
      performance: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform,
      },
    };

    const response = ApiResponse.success(
      "System statistics retrieved",
      systemStats,
    );
    response.send(res);
  });

  // Admin-only product operations
  bulkUpdateProducts = Helpers.asyncHandler(async (req, res) => {
    const { updates } = req.body;

    if (!Array.isArray(updates)) {
      const response = ApiResponse.badRequest("Updates must be an array");
      return response.send(res);
    }

    const results = [];

    for (const update of updates) {
      try {
        const { id, ...updateData } = update;
        const product = await productService.updateProduct(id, updateData);
        results.push({ id, success: true, product });
      } catch (error) {
        results.push({
          id: update.id,
          success: false,
          error: error.message,
        });
      }
    }

    const response = ApiResponse.success("Bulk update completed", { results });
    response.send(res);
  });

  // Admin-only user operations
  sendBulkEmail = Helpers.asyncHandler(async (req, res) => {
    const { subject, message, userIds } = req.body;

    if (!subject || !message) {
      const response = ApiResponse.badRequest(
        "Subject and message are required",
      );
      return response.send(res);
    }

    // In a real implementation, this would send emails to all specified users
    // For now, just simulate

    const response = ApiResponse.success("Bulk email queued for sending", {
      recipients: userIds?.length || "all users",
      subject,
      messagePreview: message.substring(0, 100) + "...",
    });
    response.send(res);
  });

  // Export data
  exportData = Helpers.asyncHandler(async (req, res) => {
    const { type, format = "json" } = req.query;

    let data;
    let filename;

    switch (type) {
      case "orders":
        const orders = await orderService.getAllOrders({ limit: 1000 });
        data = orders.data;
        filename = `orders-export-${new Date().toISOString().split("T")[0]}`;
        break;

      case "products":
        const products = await productService.getProducts({ limit: 1000 });
        data = products.data;
        filename = `products-export-${new Date().toISOString().split("T")[0]}`;
        break;

      case "users":
        const users = await userService.getUsers({ limit: 1000 });
        data = users.data;
        filename = `users-export-${new Date().toISOString().split("T")[0]}`;
        break;

      default:
        const response = ApiResponse.badRequest("Invalid export type");
        return response.send(res);
    }

    if (format === "csv") {
      // Convert to CSV (simplified)
      let csv = "";
      if (data.length > 0) {
        const headers = Object.keys(data[0]).join(",");
        csv += headers + "\n";

        data.forEach((item) => {
          const row = Object.values(item)
            .map((val) => (typeof val === "object" ? JSON.stringify(val) : val))
            .join(",");
          csv += row + "\n";
        });
      }

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}.csv"`,
      );
      return res.send(csv);
    } else {
      // JSON format
      const response = ApiResponse.success("Data exported successfully", {
        type,
        format,
        count: data.length,
        data,
      });
      response.send(res);
    }
  });
}

module.exports = new AdminController();
