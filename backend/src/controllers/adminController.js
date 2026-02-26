const orderService = require("../services/orderService");
const productService = require("../services/productService");
const userService = require("../services/userService");
const ApiResponse = require("../utils/apiResponse");
const Helpers = require("../utils/helpers");
const constants = require("../config/constants");
const { prisma } = require("../config/db.js");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken.js");
const os = require("os");

// AdminController handles all admin-related operations
class AdminController {
  getTimeRangeBounds(timeRange = "month") {
    const endDate = new Date();
    const startDate = new Date();

    switch (timeRange) {
      case "day":
        startDate.setDate(startDate.getDate() - 1);
        break;
      case "week":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 1);
    }

    return { startDate, endDate };
  }

  // Admin Login
  adminLogin = Helpers.asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Check if user exists
    if (!user) {
      const response = ApiResponse.unauthorized("Invalid email or password");
      return response.send(res);
    }

    // Check if user is admin
    if (!user.isAdmin) {
      const response = ApiResponse.forbidden("Access denied. Admin only.");
      return response.send(res);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const response = ApiResponse.unauthorized("Invalid email or password");
      return response.send(res);
    }

    // Generate JWT token and set cookie (using same generateToken function)
    const token = generateToken(user.id, res);

    // Return success response
    const response = ApiResponse.success("Admin login successful", {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
      },
      token,
    });
    response.send(res);
  });

  // Admin Logout
  adminLogout = Helpers.asyncHandler(async (req, res) => {
    // Clear the JWT cookie
    res.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    const response = ApiResponse.success("Admin logged out successfully");
    response.send(res);
  });

  // Get current admin profile
  getAdminProfile = Helpers.asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        avatar: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      const response = ApiResponse.notFound("User not found");
      return response.send(res);
    }

    const response = ApiResponse.success("Admin profile retrieved", { user });
    response.send(res);
  });

  // Get dashboard statistics for admin overview
  getDashboardStats = Helpers.asyncHandler(async (req, res) => {
    const { timeRange = "month" } = req.query;
    const { startDate, endDate } = this.getTimeRangeBounds(timeRange);

    const [
      orderStats,
      productStats,
      userStats,
      recentOrders,
      lowStockProducts,
      totalBuyingCustomers,
      activeBuyingCustomers,
      activeProductsCount,
      allTimeOrderCount,
      allTimeRevenueAgg,
    ] = await Promise.all([
      orderService.getOrderStats(timeRange),
      productService.getProductStats(),
      userService.getUserStats(),
      orderService.getAllOrders({ limit: 5 }),
      productService.getProducts({
        limit: 5,
        stock: "low",
      }),
      prisma.user.count({
        where: {
          orders: {
            some: {},
          },
        },
      }),
      prisma.user.count({
        where: {
          orders: {
            some: {
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
          },
        },
      }),
      prisma.product.count({
        where: {
          isActive: true,
        },
      }),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { total: true },
        where: {
          status: {
            not: "cancelled",
          },
        },
      }),
    ]);

    const allTimeRevenue = Number(allTimeRevenueAgg?._sum?.total || 0);

    const dashboardData = {
      overview: {
        totalRevenue: Number(allTimeRevenue.toFixed(2)),
        totalOrders: allTimeOrderCount,
        totalProducts: activeProductsCount,
        totalUsers: userStats.totalUsers,
        totalCustomers: totalBuyingCustomers,
        activeCustomers: activeBuyingCustomers,
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
        activeProducts: activeProductsCount,
        lowStockProducts: productStats.lowStockProducts,
        outOfStockProducts: productStats.outOfStockProducts,
      },
      userStats,
      recentOrders: recentOrders.data || [],
      lowStockProducts: lowStockProducts.data || [],
      timeRange,
    };

    const response = ApiResponse.success(
      "Dashboard statistics retrieved",
      dashboardData,
    );
    response.send(res);
  });

  // Get sales analytics for a date range
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
  updateOrderStatus = Helpers.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const order = await orderService.updateOrderStatus(id, status);

    const response = ApiResponse.success("Order status updated", { order });
    response.send(res);
  });

  // Get all orders with optional filtering
  getAllOrders = Helpers.asyncHandler(async (req, res) => {
    const result = await orderService.getAllOrders(req.query);

    const response = ApiResponse.success("All orders retrieved", result);
    response.send(res);
  });

  // Get all users with optional filtering
  getAllUsers = Helpers.asyncHandler(async (req, res) => {
    const result = await userService.getUsers(req.query);

    const response = ApiResponse.success("All users retrieved", result);
    response.send(res);
  });

  // Get user by ID
  getUserById = Helpers.asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await userService.getUserById(id);

    if (!user) {
      const response = ApiResponse.notFound("User not found");
      return response.send(res);
    }

    const response = ApiResponse.success("User retrieved successfully", {
      user,
    });
    response.send(res);
  });

  // Update user
  updateUser = Helpers.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated directly
    const { password, ...safeData } = updateData;

    const user = await userService.updateUser(id, safeData);

    const response = ApiResponse.success("User updated successfully", { user });
    response.send(res);
  });

  // Delete user
  deleteUser = Helpers.asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Don't allow deleting yourself
    if (id === req.user.id) {
      const response = ApiResponse.badRequest("Cannot delete your own account");
      return response.send(res);
    }

    await userService.deleteUser(id);

    const response = ApiResponse.success("User deleted successfully");
    response.send(res);
  });

  // Get all products with optional filtering
  getAllProducts = Helpers.asyncHandler(async (req, res) => {
    const result = await productService.getProducts(req.query);

    const response = ApiResponse.success("All products retrieved", result);
    response.send(res);
  });

  // Get a single product by ID
  getProductById = Helpers.asyncHandler(async (req, res) => {
    const { id } = req.params;

    const product = await productService.getProductById(id);

    const response = ApiResponse.success("Product retrieved", { product });
    response.send(res);
  });

  // Create a new product
  createProduct = Helpers.asyncHandler(async (req, res) => {
    const productData = req.body;
    const numericPrice = Number(productData?.price);

    if (!Number.isFinite(numericPrice) || numericPrice < 0.01) {
      const response = ApiResponse.badRequest(
        "Price must be at least $0.01",
      );
      return response.send(res);
    }

    productData.price = numericPrice;

    const product = await productService.createProduct(productData);

    const response = ApiResponse.success("Product created", { product });
    response.send(res);
  });

  // Update a product
  updateProduct = Helpers.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData?.price !== undefined) {
      const numericPrice = Number(updateData.price);
      if (!Number.isFinite(numericPrice) || numericPrice < 0.01) {
        const response = ApiResponse.badRequest(
          "Price must be at least $0.01",
        );
        return response.send(res);
      }
      updateData.price = numericPrice;
    }

    const product = await productService.updateProduct(id, updateData);

    const response = ApiResponse.success("Product updated", { product });
    response.send(res);
  });

  // Delete a product
  deleteProduct = Helpers.asyncHandler(async (req, res) => {
    const { id } = req.params;

    await productService.deleteProduct(id);

    const response = ApiResponse.success("Product deleted");
    response.send(res);
  });

  // Get system statistics
  getSystemStats = Helpers.asyncHandler(async (req, res) => {
    const dbCheckStartedAt = Date.now();
    let database = {
      status: "Disconnected",
      responseTimeMs: null,
    };

    try {
      await prisma.$queryRaw`SELECT 1`;
      database = {
        status: "Connected",
        responseTimeMs: Date.now() - dbCheckStartedAt,
      };
    } catch (error) {
      database = {
        status: "Disconnected",
        responseTimeMs: null,
        error: error.message,
      };
    }

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

    const loadAverage = os.loadavg();
    const cpuCores = os.cpus()?.length || 1;
    const serverStatus = loadAverage[0] < cpuCores ? "Healthy" : "High Load";

    const systemStats = {
      totals: {
        orders: totalOrders,
        revenue: totalRevenue,
        products: totalProducts,
        users: totalUsers,
      },
      pending: {
        orders: pendingOrders,
        lowStock: lowStockCount,
      },
      database,
      server: {
        status: serverStatus,
        loadAverage,
        cpuCores,
      },
      api: {
        status: "Online",
        timestamp: new Date().toISOString(),
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

  // Bulk update products
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

  // Send bulk email
  sendBulkEmail = Helpers.asyncHandler(async (req, res) => {
    const { subject, message, userIds } = req.body;

    if (!subject || !message) {
      const response = ApiResponse.badRequest(
        "Subject and message are required",
      );
      return response.send(res);
    }

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
