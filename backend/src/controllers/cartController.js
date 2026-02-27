const { prisma } = require("../config/db.js");

// CartController handles all cart-related operations
// Workflow:
// 1. Validate user authentication
// 2. Extract required data from request
// 3. Perform database operations through Prisma
// 4. Handle errors with appropriate status codes
// 5. Return consistent response format with status and data/message

// Get user's cart
// Workflow:
// 1. Extract user ID from authenticated request
// 2. Find or create cart for the user
// 3. Include cart items with product details
// 4. Calculate total price
// 5. Return success response with cart data
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find or create cart for user
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // If cart doesn't exist, create one
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    }

    // Calculate total
    const total = cart.items.reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);

    res.status(200).json({
      status: "success",
      data: {
        cart: {
          ...cart,
          total,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const normalizeMergeItems = (items = []) => {
  const itemMap = new Map();

  items.forEach((item) => {
    const productId = String(item.productId);
    const quantity = Number(item.quantity || 0);
    if (!productId || !Number.isFinite(quantity) || quantity <= 0) {
      return;
    }
    itemMap.set(productId, (itemMap.get(productId) || 0) + quantity);
  });

  return Array.from(itemMap.entries()).map(([productId, quantity]) => ({
    productId,
    quantity,
  }));
};

const getOrCreateCart = async (userId) => {
  const existing = await prisma.cart.findUnique({
    where: { userId },
  });

  if (existing) {
    return existing;
  }

  return prisma.cart.create({
    data: { userId },
  });
};

const fetchCartPayload = async (userId) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  const total = (cart?.items || []).reduce((sum, item) => {
    return sum + item.product.price * item.quantity;
  }, 0);

  return {
    cart: {
      ...(cart || { items: [] }),
      total,
    },
  };
};

// Merge frontend/guest cart into authenticated user's DB cart.
// This is implemented as a sync/replace to keep Neon cart consistent with frontend state.
const mergeCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const incomingItems = Array.isArray(req.body?.items)
      ? req.body.items
      : req.body?.guestCart?.items || [];

    const normalizedItems = normalizeMergeItems(incomingItems);
    const cart = await getOrCreateCart(userId);

    const productIds = normalizedItems.map((item) => item.productId);
    const products = productIds.length
      ? await prisma.product.findMany({
          where: {
            id: { in: productIds },
            isActive: true,
          },
          select: {
            id: true,
            stock: true,
            name: true,
          },
        })
      : [];

    const productMap = new Map(products.map((p) => [p.id, p]));
    const missingProductIds = productIds.filter((id) => !productMap.has(id));
    if (missingProductIds.length > 0) {
      return res.status(404).json({
        status: "error",
        message: "Some products were not found or inactive",
        data: {
          missingProductIds,
        },
      });
    }

    const stockIssues = normalizedItems
      .map((item) => {
        const product = productMap.get(item.productId);
        if (!product || product.stock >= item.quantity) return null;
        return {
          productId: item.productId,
          name: product.name,
          requested: item.quantity,
          available: product.stock,
        };
      })
      .filter(Boolean);

    if (stockIssues.length > 0) {
      return res.status(400).json({
        status: "error",
        message: "Some cart items exceed available stock",
        data: {
          stockIssues,
        },
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      if (normalizedItems.length > 0) {
        await tx.cartItem.createMany({
          data: normalizedItems.map((item) => ({
            cartId: cart.id,
            productId: item.productId,
            quantity: item.quantity,
          })),
        });
      }
    });

    const payload = await fetchCartPayload(userId);

    return res.status(200).json({
      status: "success",
      message: "Cart merged successfully",
      data: payload,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message || "Failed to merge cart",
    });
  }
};

// Add item to cart
// Workflow:
// 1. Extract user ID, product ID, and quantity from request
// 2. Validate product exists and has sufficient stock
// 3. Find or create cart for the user
// 4. Check if item already exists in cart
// 5. Update quantity or create new cart item
// 6. Return success response with updated cart item
const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    // Check if product exists and has enough stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Product not found",
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        status: "error",
        message: "Not enough stock available",
      });
    }

    // Find or create cart for user
    let cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
      });
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
      },
    });

    let cartItem;

    if (existingItem) {
      // Update quantity if item exists
      const newQuantity = existingItem.quantity + quantity;

      if (product.stock < newQuantity) {
        return res.status(400).json({
          status: "error",
          message: "Not enough stock available",
        });
      }

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

    res.status(201).json({
      status: "success",
      data: { cartItem },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Update cart item quantity
// Workflow:
// 1. Extract user ID, item ID, and new quantity from request
// 2. Find cart item and verify ownership
// 3. Validate stock availability for new quantity
// 4. Update cart item with new quantity
// 5. Return success response with updated cart item
const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    // Find cart item and verify ownership
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: { userId },
      },
      include: { product: true },
    });

    if (!cartItem) {
      return res.status(404).json({
        status: "error",
        message: "Cart item not found",
      });
    }

    // Check stock availability
    if (cartItem.product.stock < quantity) {
      return res.status(400).json({
        status: "error",
        message: "Not enough stock available",
      });
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: { product: true },
    });

    res.status(200).json({
      status: "success",
      data: { cartItem: updatedItem },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Remove item from cart
// Workflow:
// 1. Extract user ID and item ID from request
// 2. Find cart item and verify ownership
// 3. Delete the cart item
// 4. Return success response with confirmation message
const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    // Find cart item and verify ownership
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: { userId },
      },
    });

    if (!cartItem) {
      return res.status(404).json({
        status: "error",
        message: "Cart item not found",
      });
    }

    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    res.status(200).json({
      status: "success",
      message: "Item removed from cart",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Clear cart
// Workflow:
// 1. Extract user ID from request
// 2. Find user's cart
// 3. Delete all items in the cart
// 4. Return success response with confirmation message
const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      return res.status(404).json({
        status: "error",
        message: "Cart not found",
      });
    }

    // Delete all items in cart
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    res.status(200).json({
      status: "success",
      message: "Cart cleared successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get cart count
// Workflow:
// 1. Extract user ID from request
// 2. Find user's cart with items
// 3. Calculate total quantity of all items
// 4. Return success response with count
const getCartCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: true,
      },
    });

    const count = cart
      ? cart.items.reduce((sum, item) => sum + item.quantity, 0)
      : 0;

    res.status(200).json({
      status: "success",
      data: { count },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartCount,
  mergeCart,
};
