const { prisma } = require("../config/db");

// Helper function to format product response
const formatProductResponse = (product) => {
  if (!product) return null;

  return {
    id: product.id,
    name: product.name,
    description: product.description || "",
    price: parseFloat(product.price),
    stock_quantity: product.stock || 0,
    category: product.category || "Uncategorized",
    color: product.color || "Silver",
    material: product.material || "",
    sku: product.sku || "",
    image_url: product.images?.[0] || "",
    images: product.images || [],
    is_featured: product.isFeatured || false,
    is_active: product.isActive !== false,
    created_at: product.createdAt,
    updated_at: product.updatedAt,
  };
};

// GET /api/products - Get all products with filtering
const getAllProducts = async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      featured,
      search,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter
    const where = { isActive: true };

    if (category) where.category = category;
    if (featured === "true") where.isFeatured = true;

    // Price range filter
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Execute queries
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.product.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: products.map(formatProductResponse),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("❌ GetAllProducts Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

// GET /api/products/:id - Get single product
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: formatProductResponse(product),
    });
  } catch (error) {
    console.error("❌ GetProductById Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

// POST /api/products - Create new product
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      stock,
      images,
      category,
      color,
      material,
      sku,
      isFeatured,
      isActive,
    } = req.body;

    // Validate required fields
    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: "Name and price are required fields",
      });
    }

    // Check if SKU is unique (if provided)
    if (sku) {
      const existingProduct = await prisma.product.findUnique({
        where: { sku },
      });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: "Product with this SKU already exists",
        });
      }
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        description: description || "",
        price: parseFloat(price),
        stock: parseInt(stock) || 0,
        images: images || [],
        category: category || null,
        color: color || null,
        material: material || null,
        sku: sku || null,
        isFeatured: isFeatured || false,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: formatProductResponse(product),
    });
  } catch (error) {
    console.error("❌ CreateProduct Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.message,
    });
  }
};

// PUT /api/products/:id - Update product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check SKU uniqueness if being updated
    if (updateData.sku && updateData.sku !== existingProduct.sku) {
      const skuExists = await prisma.product.findUnique({
        where: { sku: updateData.sku },
      });
      if (skuExists) {
        return res.status(400).json({
          success: false,
          message: "Product with this SKU already exists",
        });
      }
    }

    // Prepare update data
    const data = {};
    if (updateData.name !== undefined) data.name = updateData.name;
    if (updateData.description !== undefined)
      data.description = updateData.description;
    if (updateData.price !== undefined)
      data.price = parseFloat(updateData.price);
    if (updateData.stock !== undefined) data.stock = parseInt(updateData.stock);
    if (updateData.images !== undefined) data.images = updateData.images;
    if (updateData.category !== undefined) data.category = updateData.category;
    if (updateData.color !== undefined) data.color = updateData.color;
    if (updateData.material !== undefined) data.material = updateData.material;
    if (updateData.sku !== undefined) data.sku = updateData.sku;
    if (updateData.isFeatured !== undefined)
      data.isFeatured = updateData.isFeatured;
    if (updateData.isActive !== undefined) data.isActive = updateData.isActive;

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id },
      data,
    });

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: formatProductResponse(updatedProduct),
    });
  } catch (error) {
    console.error("❌ UpdateProduct Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    });
  }
};

// DELETE /api/products/:id - Delete product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if product is in any orders
    const orderItems = await prisma.orderItem.count({
      where: { productId: id },
    });

    if (orderItems > 0) {
      // Soft delete - just mark as inactive
      await prisma.product.update({
        where: { id },
        data: { isActive: false },
      });

      return res.status(200).json({
        success: true,
        message: "Product deactivated successfully (has order history)",
      });
    }

    // Hard delete if no references
    await prisma.product.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("❌ DeleteProduct Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

// GET /api/products/featured - Get featured products
const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const products = await prisma.product.findMany({
      where: {
        isFeatured: true,
        isActive: true,
      },
      take: parseInt(limit),
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      data: products.map(formatProductResponse),
    });
  } catch (error) {
    console.error("❌ GetFeaturedProducts Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch featured products",
      error: error.message,
    });
  }
};

// GET /api/products/category/:category - Get products by category
const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: {
          category,
          isActive: true,
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({
        where: {
          category,
          isActive: true,
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: products.map(formatProductResponse),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("❌ GetProductsByCategory Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products by category",
      error: error.message,
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getProductsByCategory,
};
