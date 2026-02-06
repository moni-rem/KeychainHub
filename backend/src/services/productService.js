const prisma = require("../config/database");
const ApiError = require("../utils/apiError");
const Helpers = require("../utils/helpers");
const constants = require("../config/constants");

class ProductService {
  async createProduct(productData, images) {
    // Process image URLs
    const imageUrls = images.map((img) => `/uploads/products/${img.filename}`);

    const product = await prisma.product.create({
      data: {
        ...productData,
        images: imageUrls,
      },
    });

    return product;
  }

  async getProducts(query) {
    const {
      page = 1,
      limit = 10,
      category,
      minPrice,
      maxPrice,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      isFeatured,
    } = query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = {};

    if (category) {
      where.category = category;
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

    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured === "true";
    }

    // Execute queries
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      prisma.product.count({ where }),
    ]);

    return Helpers.paginate(products, page, limit, total);
  }

  async getProductById(id) {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    return product;
  }

  async updateProduct(id, updateData, newImages = []) {
    // Get existing product
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new ApiError(404, "Product not found");
    }

    // Handle images
    let images = existingProduct.images;
    if (newImages && newImages.length > 0) {
      const newImageUrls = newImages.map(
        (img) => `/uploads/products/${img.filename}`,
      );
      images = [...images, ...newImageUrls];
    }

    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...updateData,
        ...(images && { images }),
      },
    });

    return product;
  }

  async deleteProduct(id) {
    // Get product first
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    // Delete product images from server
    product.images.forEach((imagePath) => {
      Helpers.deleteFile(imagePath);
    });

    // Delete product from database
    await prisma.product.delete({
      where: { id },
    });

    return { message: "Product deleted successfully" };
  }

  async updateStock(productId, quantity) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    if (product.stock < quantity) {
      throw new ApiError(400, "Insufficient stock");
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        stock: product.stock - quantity,
      },
    });

    return updatedProduct;
  }

  async getFeaturedProducts(limit = 8) {
    const products = await prisma.product.findMany({
      where: { isFeatured: true },
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return products;
  }

  async getProductsByCategory(category, limit = 20) {
    if (!Helpers.validateCategory(category)) {
      throw new ApiError(
        400,
        `Invalid category. Must be one of: ${constants.CATEGORIES.join(", ")}`,
      );
    }

    const products = await prisma.product.findMany({
      where: { category },
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return products;
  }

  async searchProducts(searchTerm, filters = {}) {
    const { category, minPrice, maxPrice, limit = 20 } = filters;

    const where = {
      OR: [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
      ],
    };

    if (category) {
      where.category = category;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    const products = await prisma.product.findMany({
      where,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return products;
  }

  async getProductStats() {
    const [
      totalProducts,
      totalStock,
      averagePrice,
      lowStockProducts,
      outOfStockProducts,
      totalValue,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.aggregate({
        _sum: { stock: true },
      }),
      prisma.product.aggregate({
        _avg: { price: true },
      }),
      prisma.product.count({
        where: { stock: { lt: 10 } },
      }),
      prisma.product.count({
        where: { stock: { equals: 0 } },
      }),
      prisma.$queryRaw`
        SELECT SUM(price * stock) as total_value FROM products
      `,
    ]);

    return {
      totalProducts,
      totalStock: totalStock._sum.stock || 0,
      averagePrice: averagePrice._avg.price
        ? averagePrice._avg.price.toFixed(2)
        : "0.00",
      lowStockProducts,
      outOfStockProducts,
      totalValue: totalValue[0]?.total_value || 0,
    };
  }

  async getCategories() {
    const categories = await prisma.product.groupBy({
      by: ["category"],
      _count: {
        id: true,
      },
      where: {
        category: {
          not: null,
        },
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
    });

    return categories.map((cat) => ({
      name: cat.category,
      count: cat._count.id,
    }));
  }
}

module.exports = new ProductService();
