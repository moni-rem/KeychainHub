const prisma = require("../config/database");
const ApiError = require("../utils/apiError");
const Helpers = require("../utils/helpers");
const cartService = require("./cartService");
const productService = require("./productService");
const constants = require("../config/constants");

class OrderService {
  async createOrder(userId, orderData) {
    const { address, phone, notes } = orderData;

    // Validate cart for order
    const cartValidation = await cartService.validateCartForOrder(userId);

    // Calculate total
    const total = parseFloat(cartValidation.subtotal);

    // Create order with transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId,
          total,
          address,
          phone,
          notes,
          items: {
            create: cartValidation.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                },
              },
            },
          },
        },
      });

      // Update product stock
      for (const item of cartValidation.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Clear cart
      const cart = await tx.cart.findUnique({
        where: { userId },
      });

      if (cart) {
        await tx.cartItem.deleteMany({
          where: { cartId: cart.id },
        });
      }

      return newOrder;
    });

    return order;
  }

  async getUserOrders(userId, query = {}) {
    const { page = 1, limit = 10, status } = query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = { userId };
    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({ where }),
    ]);

    return Helpers.paginate(orders, page, limit, total);
  }

  async getOrderById(userId, orderId) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                price: true,
                images: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    // Check if user owns this order (unless admin)
    if (order.userId !== userId) {
      throw new ApiError(403, "Access denied");
    }

    return order;
  }

  async updateOrderStatus(orderId, status) {
    if (!Object.values(constants.ORDER_STATUS).includes(status)) {
      throw new ApiError(
        400,
        `Invalid status. Must be one of: ${Object.values(constants.ORDER_STATUS).join(", ")}`,
      );
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    return order;
  }

  async getAllOrders(query = {}) {
    const { page = 1, limit = 20, status, startDate, endDate } = query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (status) {
      where.status = status;
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({ where }),
    ]);

    return Helpers.paginate(orders, page, limit, total);
  }

  async getOrderStats(timeRange = "month") {
    let startDate;
    const endDate = new Date();

    switch (timeRange) {
      case "day":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 1);
        break;
      case "week":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "month":
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case "year":
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
    }

    const [
      totalOrders,
      totalRevenue,
      pendingOrders,
      completedOrders,
      recentOrders,
      topProducts,
    ] = await Promise.all([
      prisma.order.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          status: {
            not: "cancelled",
          },
        },
      }),
      prisma.order.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          status: "pending",
        },
      }),
      prisma.order.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          status: "delivered",
        },
      }),
      prisma.order.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        take: 10,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.orderItem.groupBy({
        by: ["productId"],
        _sum: {
          quantity: true,
          price: true,
        },
        where: {
          order: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
            status: {
              not: "cancelled",
            },
          },
        },
        orderBy: {
          _sum: {
            quantity: "desc",
          },
        },
        take: 10,
      }),
    ]);

    // Get product details for top products
    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: {
            name: true,
            category: true,
          },
        });

        return {
          productId: item.productId,
          productName: product?.name || "Unknown",
          category: product?.category || "Unknown",
          quantity: item._sum.quantity || 0,
          revenue: item._sum.price ? parseFloat(item._sum.price.toFixed(2)) : 0,
        };
      }),
    );

    return {
      timeRange,
      startDate,
      endDate,
      totalOrders,
      totalRevenue: totalRevenue._sum.total
        ? parseFloat(totalRevenue._sum.total.toFixed(2))
        : 0,
      pendingOrders,
      completedOrders,
      cancellationRate:
        totalOrders > 0
          ? (
              ((totalOrders - completedOrders - pendingOrders) / totalOrders) *
              100
            ).toFixed(2)
          : "0.00",
      averageOrderValue:
        totalOrders > 0
          ? (totalRevenue._sum.total / totalOrders).toFixed(2)
          : "0.00",
      recentOrders,
      topProducts: topProductsWithDetails,
    };
  }

  async getSalesAnalytics(startDate, endDate) {
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        status: {
          not: "cancelled",
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Get daily sales
    const dailySales = {};
    orders.forEach((order) => {
      const date = order.createdAt.toISOString().split("T")[0];
      if (!dailySales[date]) {
        dailySales[date] = 0;
      }
      dailySales[date] += order.total;
    });

    // Get product sales
    const productSales = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            productId: item.productId,
            productName: item.product.name,
            quantity: 0,
            revenue: 0,
          };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.price * item.quantity;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return {
      totalSales: parseFloat(totalSales.toFixed(2)),
      totalOrders,
      averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
      dailySales: Object.entries(dailySales).map(([date, sales]) => ({
        date,
        sales: parseFloat(sales.toFixed(2)),
      })),
      topProducts,
    };
  }
}

module.exports = new OrderService();
