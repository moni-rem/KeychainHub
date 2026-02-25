const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class ProductService {
  // Get all products with filtering and pagination
  async getProducts(query = {}) {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      is_featured,
      isFeatured,
      stock,
      minPrice,
      maxPrice,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where = {
      isActive: true,
    };

    if (category) {
      where.category = category;
    }

    const featuredFilter = is_featured ?? isFeatured;
    if (featuredFilter !== undefined) {
      where.isFeatured = featuredFilter === true || featuredFilter === "true";
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (stock === "low") {
      where.stock = { lt: 10, gt: 0 };
    } else if (stock === "out") {
      where.stock = 0;
    } else if (stock === "in") {
      where.stock = { gt: 0 };
    }

    // Get products
    const products = await prisma.product.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    // Get total count
    const total = await prisma.product.count({ where });

    return {
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get single product by ID
  async getProductById(id) {
    return await prisma.product.findUnique({
      where: { id },
    });
  }

  // Create new product
  async createProduct(data) {
    return await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock,
        images: data.images || [],
        category: data.category,
        color: data.color,
        material: data.material,
        sku: data.sku,
        isFeatured:
          data.is_featured !== undefined
            ? data.is_featured
            : data.isFeatured || false,
        isActive:
          data.is_active !== undefined
            ? data.is_active
            : data.isActive !== undefined
              ? data.isActive
              : true,
      },
    });
  }

  // Update product
  async updateProduct(id, data) {
    return await prisma.product.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.stock !== undefined && { stock: data.stock }),
        ...(data.images !== undefined && { images: data.images }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.color !== undefined && { color: data.color }),
        ...(data.material !== undefined && { material: data.material }),
        ...(data.sku !== undefined && { sku: data.sku }),
        ...(data.is_featured !== undefined && { isFeatured: data.is_featured }),
        ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
        ...(data.is_active !== undefined && { isActive: data.is_active }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
  }

  // Delete product
  async deleteProduct(id) {
    try {
      return await prisma.product.delete({
        where: { id },
      });
    } catch (error) {
      // If product is referenced by other records (orders/cart), fall back to soft delete.
      if (error?.code === "P2003" || error?.code === "P2014") {
        return await prisma.product.update({
          where: { id },
          data: { isActive: false },
        });
      }
      throw error;
    }
  }

  // Get product statistics
  async getProductStats() {
    const [
      totalProducts,
      activeProducts,
      lowStockProducts,
      outOfStockProducts,
      featuredProducts,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.count({
        where: { stock: { lt: 10, gt: 0 }, isActive: true },
      }),
      prisma.product.count({ where: { stock: 0, isActive: true } }),
      prisma.product.count({ where: { isFeatured: true, isActive: true } }),
    ]);

    return {
      totalProducts,
      activeProducts,
      lowStockProducts,
      outOfStockProducts,
      featuredProducts,
    };
  }
}

module.exports = new ProductService();
