const { prisma } = require("../config/db.js");

// ProductController handles all product-related operations
// Workflow:
// 1. Extract required data from request
// 2. Perform database operations through Prisma
// 3. Handle errors with appropriate status codes
// 4. Return consistent response format with status and data/message

// Get all keychains with optional filtering
// Workflow:
// 1. Extract filter and pagination parameters from query
// 2. Build filter object based on provided parameters
// 3. Calculate pagination offset
// 4. Query database with filters and pagination
// 5. Return success response with products and pagination info
const getAllKeychains = async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      featured,
      page = 1,
      limit = 10,
    } = req.query;

    // Build filter object
    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.gte = parseFloat(minPrice);
      if (maxPrice) filter.price.lte = parseFloat(maxPrice);
    }

    if (featured === "true") {
      filter.isFeatured = true;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const keychains = await prisma.product.findMany({
      where: filter,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.product.count({ where: filter });

    res.status(200).json({
      status: "success",
      data: {
        keychains,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
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

// Get single keychain by ID
// Workflow:
// 1. Extract keychain ID from params
// 2. Query database for the keychain
// 3. Handle case where keychain is not found
// 4. Return success response with keychain data
const getKeychainById = async (req, res) => {
  try {
    const { id } = req.params;

    const keychain = await prisma.product.findUnique({
      where: { id },
    });

    if (!keychain) {
      return res.status(404).json({
        status: "error",
        message: "Keychain not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: { keychain },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Create new keychain (admin only)
// Workflow:
// 1. Extract keychain data from request body
// 2. Parse and validate numeric values
// 3. Create new keychain in database
// 4. Return success response with created keychain
const createKeychain = async (req, res) => {
  try {
    const { name, description, price, stock, images, category, isFeatured } =
      req.body;

    const keychain = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        images: images || [],
        category,
        isFeatured: isFeatured || false,
      },
    });

    res.status(201).json({
      status: "success",
      data: { keychain },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Update keychain (admin only)
// Workflow:
// 1. Extract keychain ID from params and update data from body
// 2. Check if keychain exists
// 3. Parse and validate numeric values
// 4. Update keychain in database
// 5. Return success response with updated keychain
const updateKeychain = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, images, category, isFeatured } =
      req.body;

    // Check if keychain exists
    const existingKeychain = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingKeychain) {
      return res.status(404).json({
        status: "error",
        message: "Keychain not found",
      });
    }

    const updatedKeychain = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(price && { price: parseFloat(price) }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(images && { images }),
        ...(category && { category }),
        ...(isFeatured !== undefined && { isFeatured }),
      },
    });

    res.status(200).json({
      status: "success",
      data: { keychain: updatedKeychain },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Delete keychain (admin only)
// Workflow:
// 1. Extract keychain ID from params
// 2. Check if keychain exists
// 3. Delete keychain from database
// 4. Return success response with confirmation message
const deleteKeychain = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if keychain exists
    const existingKeychain = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingKeychain) {
      return res.status(404).json({
        status: "error",
        message: "Keychain not found",
      });
    }

    await prisma.product.delete({
      where: { id },
    });

    res.status(200).json({
      status: "success",
      message: "Keychain deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get featured keychains
// Workflow:
// 1. Extract limit from query params
// 2. Query database for featured keychains
// 3. Return success response with featured keychains
const getFeaturedKeychains = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const keychains = await prisma.product.findMany({
      where: { isFeatured: true },
      take: parseInt(limit),
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      status: "success",
      data: { keychains },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get keychains by category
// Workflow:
// 1. Extract category from params and pagination from query
// 2. Calculate pagination offset
// 3. Query database for keychains in specified category
// 4. Return success response with keychains and pagination info
const getKeychainsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const keychains = await prisma.product.findMany({
      where: { category },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.product.count({ where: { category } });

    res.status(200).json({
      status: "success",
      data: {
        keychains,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
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

module.exports = {
  getAllKeychains,
  getKeychainById,
  createKeychain,
  updateKeychain,
  deleteKeychain,
  getFeaturedKeychains,
  getKeychainsByCategory,
};
