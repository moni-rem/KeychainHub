const prisma = require("../config/database");
const ApiError = require("../utils/apiError");
const Helpers = require("../utils/helpers");
const productService = require("./productService");

class CartService {
  async getCart(userId) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                images: true,
                stock: true,
                category: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!cart) {
      throw new ApiError(404, "Cart not found");
    }

    // Calculate totals
    const subtotal = Helpers.calculateCartTotal(cart.items);
    const itemCount = cart.items.reduce(
      (total, item) => total + item.quantity,
      0,
    );

    return {
      cart,
      subtotal: Helpers.formatPrice(subtotal),
      itemCount,
      formattedItems: cart.items.map((item) => ({
        ...item,
        itemTotal: Helpers.formatPrice(item.product.price * item.quantity),
      })),
    };
  }

  async addToCart(userId, productId, quantity = 1) {
    // Check product exists and has stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    if (product.stock < quantity) {
      throw new ApiError(400, "Insufficient stock");
    }

    // Get or create cart
    let cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
      });
    }

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
      },
    });

    let cartItem;
    if (existingItem) {
      // Calculate new quantity
      const newQuantity = existingItem.quantity + quantity;

      // Check stock availability for new quantity
      if (product.stock < newQuantity) {
        throw new ApiError(
          400,
          `Cannot add ${quantity} more. Only ${product.stock - existingItem.quantity} available in stock.`,
        );
      }

      // Update quantity
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: { product: true },
      });
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
        include: { product: true },
      });
    }

    return this.getCart(userId);
  }

  async updateCartItem(userId, itemId, quantity) {
    if (quantity < 1) {
      // Remove item if quantity is 0
      return this.removeFromCart(userId, itemId);
    }

    if (quantity > 100) {
      throw new ApiError(400, "Maximum quantity per item is 100");
    }

    // Get cart item with product info
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          where: { id: itemId },
          include: { product: true },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new ApiError(404, "Cart item not found");
    }

    const cartItem = cart.items[0];

    // Check stock availability
    if (cartItem.product.stock < quantity) {
      throw new ApiError(
        400,
        `Only ${cartItem.product.stock} available in stock`,
      );
    }

    // Update quantity
    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    return this.getCart(userId);
  }

  async removeFromCart(userId, itemId) {
    // Check if item exists in user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          where: { id: itemId },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new ApiError(404, "Cart item not found");
    }

    // Remove item
    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    return this.getCart(userId);
  }

  async clearCart(userId) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new ApiError(404, "Cart not found");
    }

    // Delete all cart items
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return this.getCart(userId);
  }

  async getCartItemCount(userId) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: true,
      },
    });

    if (!cart) {
      return 0;
    }

    return cart.items.reduce((total, item) => total + item.quantity, 0);
  }

  async validateCartForOrder(userId) {
    const cartResult = await this.getCart(userId);

    if (cartResult.itemCount === 0) {
      throw new ApiError(400, "Cart is empty");
    }

    // Check stock for all items
    const outOfStockItems = [];
    const lowStockItems = [];

    for (const item of cartResult.cart.items) {
      if (item.product.stock < item.quantity) {
        outOfStockItems.push({
          productId: item.productId,
          productName: item.product.name,
          requested: item.quantity,
          available: item.product.stock,
        });
      } else if (item.product.stock < 10) {
        lowStockItems.push({
          productId: item.productId,
          productName: item.product.name,
          stock: item.product.stock,
        });
      }
    }

    if (outOfStockItems.length > 0) {
      throw new ApiError(400, "Some items are out of stock", {
        outOfStockItems,
        lowStockItems,
      });
    }

    return {
      cart: cartResult.cart,
      subtotal: cartResult.subtotal,
      items: cartResult.cart.items,
      warnings:
        lowStockItems.length > 0
          ? {
              message: "Some items have low stock",
              lowStockItems,
            }
          : null,
    };
  }
}

module.exports = new CartService();
