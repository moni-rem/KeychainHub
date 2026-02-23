const orderService = require("../services/orderService");
const productService = require("../services/productService");
const userService = require("../services/userService");
const ApiResponse = require("../utils/apiResponse");
const Helpers = require("../utils/helpers");
const constants = require("../config/constants");

// AdminController handles all admin-related operations
// Workflow:
// 1. Validate input parameters
// 2. Call appropriate service for business logic
// 3. Handle errors with appropriate status codes
// 4. Return consistent response format with status and data/message
class AdminController {
  // Get dashboard statistics for admin overview
  // Workflow:
  // 1. Extract timeRange from query params (default: "month")
  // 2. Fetch data from multiple services in parallel
  // 3. Calculate derived metrics (growth rate)
  // 4. Structure dashboard data
  // 5. Return success response with dashboard data
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

  // Get sales analytics for a date range
  // Workflow:
  // 1. Extract startDate and endDate from query params
  // 2. Validate required parameters
  // 3. Call orderService to get analytics data
  // 4. Return success response with analytics data
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

  // Update order status
  // Workflow:
  // 1. Extract order ID from params and status from body
  // 2. Call orderService to update the order status
  // 3. Return success response with updated order
  updateOrderStatus = Helpers.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const order = await orderService.updateOrderStatus(id, status);

    const response = ApiResponse.success("Order status updated", { order });
    response.send(res);
  });

  // Get all orders with optional filtering
  // Workflow:
  // 1. Extract query parameters for filtering
  // 2. Call orderService to get orders
  // 3. Return success response with orders data
  getAllOrders = Helpers.asyncHandler(async (req, res) => {
    const result = await orderService.getAllOrders(req.query);

    const response = ApiResponse.success("All orders retrieved", result);
    response.send(res);
  });

  // Get all users with optional filtering
  // Workflow:
  // 1. Extract query parameters for filtering
  // 2. Call userService to get users
  // 3. Return success response with users data
  getAllUsers = Helpers.asyncHandler(async (req, res) => {
    const result = await userService.getUsers(req.query);

    const response = ApiResponse.success("All users retrieved", result);
    response.send(res);
  });

  // Get all products with optional filtering
  // Workflow:
  // 1. Extract query parameters for filtering
  // 2. Call productService to get products
  // 3. Return success response with products data
  getAllProducts = Helpers.asyncHandler(async (req, res) => {
    const result = await productService.getProducts(req.query);

    const response = ApiResponse.success("All products retrieved", result);
    response.send(res);
  });

  // Get system statistics for admin monitoring
  // Workflow:
  // 1. Fetch data from multiple services in parallel
  // 2. Calculate system performance metrics
  // 3. Structure system statistics data
  // 4. Return success response with system stats
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
  // Bulk update products
  // Workflow:
  // 1. Extract updates array from request body
  // 2. Validate that updates is an array
  // 3. Process each update individually
  // 4. Track success/failure for each update
  // 5. Return success response with results
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
  // Send bulk email to users
  // Workflow:
  // 1. Extract subject, message, and userIds from request body
  // 2. Validate required parameters
  // 3. Simulate email sending (in production, would integrate with email service)
  // 4. Return success response with email details
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
  // Export data in different formats
  // Workflow:
  // 1. Extract export type and format from query params
  // 2. Fetch data based on export type
  // 3. Format data according to requested format (JSON or CSV)
  // 4. Set appropriate headers for file download
  // 5. Return formatted data
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
