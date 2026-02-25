const { prisma } = require("../config/db");
const ApiError = require("../utils/apiError");
const BcryptUtils = require("../utils/bcrypt");

class UserService {
  // Get all users with filtering and pagination
  async getUsers(query = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      status,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role) {
      if (role === "admin") {
        where.isAdmin = true;
      } else if (role === "customer") {
        where.isAdmin = false;
      }
    }

    // `User.isActive` is not present in the Prisma schema.
    // Keep the query param for API compatibility, but do not DB-filter on it.
    void status;

    // Get users
    const users = await prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: {
        [sortBy]: sortOrder,
      },
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
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    // Get total count
    const total = await prisma.user.count({ where });

    // Transform users
    const transformedUsers = users.map((user) => ({
      id: user.id,
      name: user.name || "Unknown",
      email: user.email,
      phone: user.phone || "",
      role: user.isAdmin ? "admin" : "customer",
      status: "active",
      joinDate: user.createdAt,
      orders: user._count.orders,
      totalSpent: 0, // You'll need to calculate this from orders
      location: user.address ? user.address.split(",").pop()?.trim() || "" : "",
      avatar: user.avatar || null,
    }));

    return {
      data: transformedUsers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get customers (users with orders)
  async getCustomers(query = {}) {
    const { page = 1, limit = 10, search } = query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {
      orders: {
        some: {}, // Has at least one order
      },
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        include: {
          orders: {
            orderBy: { createdAt: "desc" },
            take: 5,
          },
          _count: {
            select: { orders: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    // Transform customers
    const transformedCustomers = await Promise.all(
      customers.map(async (customer) => {
        const totalSpent = customer.orders.reduce(
          (sum, order) => sum + order.total,
          0,
        );

        return {
          id: customer.id,
          name: customer.name || "Unknown",
          email: customer.email,
          phone: customer.phone || "",
          role: customer.isAdmin ? "admin" : "customer",
          status: "active",
          joinDate: customer.createdAt,
          orders: customer._count.orders,
          totalSpent,
          location: customer.address
            ? customer.address.split(",").pop()?.trim() || ""
            : "",
          avatar: customer.avatar || null,
          recentOrders: customer.orders.slice(0, 3),
        };
      }),
    );

    return {
      data: transformedCustomers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get user by ID
  async getUserById(id) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        orders: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const totalSpent = user.orders.reduce((sum, order) => sum + order.total, 0);

    return {
      id: user.id,
      name: user.name || "Unknown",
      email: user.email,
      phone: user.phone || "",
      address: user.address || "",
      avatar: user.avatar || null,
      role: user.isAdmin ? "admin" : "customer",
      status: "active",
      joinDate: user.createdAt,
      orders: user._count.orders,
      totalSpent,
      recentOrders: user.orders,
    };
  }

  // Search users
  async searchUsers(query) {
    if (!query) return [];

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 20,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
      },
    });

    return users;
  }

  // Update user
  async updateUser(id, updateData) {
    const {
      id: _,
      createdAt,
      updatedAt,
      password,
      isActive,
      status,
      ...safeData
    } = updateData;

    void isActive;
    void status;

    const user = await prisma.user.update({
      where: { id },
      data: safeData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        avatar: true,
        isAdmin: true,
        updatedAt: true,
      },
    });

    return user;
  }

  // Update user role
  async updateUserRole(id, isAdmin) {
    const user = await prisma.user.update({
      where: { id },
      data: { isAdmin },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
      },
    });

    return user;
  }

  // Delete user
  async deleteUser(id) {
    // Check if user has orders
    const userWithOrders = await prisma.user.findUnique({
      where: { id },
      include: {
        orders: true,
      },
    });

    if (userWithOrders?.orders?.length > 0) {
      return { message: "User has order history and cannot be deleted" };
    }

    // Hard delete if no orders
    await prisma.user.delete({
      where: { id },
    });
    return { message: "User deleted successfully" };
  }

  // Reset password
  async resetPassword(id) {
    const newPassword = BcryptUtils.generateRandomPassword();
    const hashedPassword = await BcryptUtils.hashPassword(newPassword);

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return {
      message: "Password reset successfully",
      newPassword, // In production, send this via email instead
    };
  }

  // Get user statistics
  async getUserStats() {
    const [
      totalUsers,
      adminUsers,
      newUsersToday,
      newUsersThisMonth,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isAdmin: true } }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);

    return {
      totalUsers,
      adminUsers,
      activeUsers: totalUsers,
      inactiveUsers: 0,
      regularUsers: totalUsers - adminUsers,
      newUsersToday,
      newUsersThisMonth,
    };
  }

  // Get user activity
  async getUserActivity(userId, limit = 50) {
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: parseInt(limit),
      include: {
        items: {
          take: 3,
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return orders.map((order) => ({
      id: order.id,
      type: "order",
      action: `Placed order #${order.id.slice(0, 8)}`,
      amount: order.total,
      status: order.status,
      timestamp: order.createdAt,
      items: order.items.length,
    }));
  }
}

module.exports = new UserService();
