const prisma = require("../config/database");
const ApiError = require("../utils/apiError");
const Helpers = require("../utils/helpers");
const BcryptUtils = require("../utils/bcrypt");

class UserService {
  async getUsers(query) {
    const {
      page = 1,
      limit = 20,
      search,
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

    // Execute queries
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          phone: true,
          address: true,
          isAdmin: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              orders: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return Helpers.paginate(users, page, limit, total);
  }

  async getUserById(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        phone: true,
        address: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
        orders: {
          select: {
            id: true,
            total: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return user;
  }

  async updateUser(userId, updateData) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        phone: true,
        address: true,
        isAdmin: true,
      },
    });

    return user;
  }

  async deleteUser(userId) {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Cannot delete admin users
    if (user.isAdmin) {
      throw new ApiError(403, "Cannot delete admin users");
    }

    // Delete user with transaction
    await prisma.$transaction(async (tx) => {
      // Delete user's cart items
      const cart = await tx.cart.findUnique({
        where: { userId },
      });

      if (cart) {
        await tx.cartItem.deleteMany({
          where: { cartId: cart.id },
        });
      }

      // Delete user's cart
      await tx.cart.deleteMany({
        where: { userId },
      });

      // Delete user's orders
      const orders = await tx.order.findMany({
        where: { userId },
        select: { id: true },
      });

      if (orders.length > 0) {
        const orderIds = orders.map((order) => order.id);

        // Delete order items
        await tx.orderItem.deleteMany({
          where: { orderId: { in: orderIds } },
        });

        // Delete orders
        await tx.order.deleteMany({
          where: { id: { in: orderIds } },
        });
      }

      // Delete user
      await tx.user.delete({
        where: { id: userId },
      });
    });

    return { message: "User deleted successfully" };
  }

  async updateUserRole(userId, isAdmin) {
    const user = await prisma.user.update({
      where: { id: userId },
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

  async resetPassword(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Generate random password
    const newPassword = BcryptUtils.generateRandomPassword();
    const hashedPassword = await BcryptUtils.hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return {
      message: "Password reset successfully",
      newPassword, // Note: In production, send this via email
    };
  }

  async getUserStats() {
    const [totalUsers, totalAdmins, usersThisMonth, usersLastMonth] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({
          where: { isAdmin: true },
        }),
        prisma.user.count({
          where: {
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        }),
        prisma.user.count({
          where: {
            createdAt: {
              gte: new Date(
                new Date().getFullYear(),
                new Date().getMonth() - 1,
                1,
              ),
              lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        }),
      ]);

    return {
      totalUsers,
      totalAdmins,
      usersThisMonth,
      usersLastMonth,
      growthRate:
        usersLastMonth > 0
          ? (
              ((usersThisMonth - usersLastMonth) / usersLastMonth) *
              100
            ).toFixed(2)
          : usersThisMonth > 0
            ? "100.00"
            : "0.00",
    };
  }
}

module.exports = new UserService();
