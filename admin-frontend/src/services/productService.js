import { get, post, put, del, upload } from "./api";

class ProductService {
  normalizeApiError(error, fallback = "Request failed") {
    const status = error?.status || error?.response?.status || 500;
    const message =
      error?.message ||
      error?.error ||
      error?.data?.message ||
      error?.response?.data?.message ||
      fallback;
    const normalized = new Error(message);
    normalized.status = status;
    return normalized;
  }

  extractProduct(payload) {
    if (!payload) return null;
    if (payload.product) return payload.product;
    if (payload.data?.data?.product) return payload.data.data.product;
    if (payload.data?.product) return payload.data.product;
    if (payload.data?.data?.id && payload.data?.data?.name) return payload.data.data;
    if (payload.data?.id && payload.data?.name) return payload.data;
    if (payload.id && payload.name) return payload;
    return null;
  }

  // Helper function to transform product data from backend to frontend format
  transformProduct(product) {
    if (!product) return null;

    return {
      id: product.id,
      name: product.name,
      description: product.description || "",
      price: product.price,
      stock_quantity: product.stock || 0,
      sku: product.sku || "",
      category: product.category || "Uncategorized",
      color: product.color || "Silver",
      material: product.material || "",
      image_url: product.images?.[0] || "",
      images: product.images || [],
      is_featured: product.isFeatured || false,
      is_active: product.isActive !== false,
      created_at: product.createdAt,
      updated_at: product.updatedAt,
    };
  }

  // Get all products with filters
  async getAllProducts(params = {}) {
    // Format parameters to match backend schema
    const formattedParams = {};

    if (params.search && params.search.trim() !== "") {
      formattedParams.search = params.search.trim();
    }
    if (params.category && params.category !== "") {
      formattedParams.category = params.category;
    }
    if (params.minPrice && params.minPrice !== "") {
      formattedParams.minPrice = params.minPrice.toString();
    }
    if (params.maxPrice && params.maxPrice !== "") {
      formattedParams.maxPrice = params.maxPrice.toString();
    }
    const featuredParam = params.featured ?? params.isFeatured;
    if (featuredParam !== undefined && featuredParam !== "") {
      formattedParams.isFeatured = featuredParam;
    }
    if (params.page) {
      formattedParams.page = params.page.toString();
    }
    if (params.limit) {
      formattedParams.limit = params.limit.toString();
    }
    if (params.sortBy) {
      formattedParams.sortBy = params.sortBy;
    }
    if (params.sortOrder) {
      formattedParams.sortOrder = params.sortOrder;
    }

    try {
      const response = await get("/admin/products", { params: formattedParams });
      const payload = response?.data && !Array.isArray(response.data)
        ? response.data
        : response;

      let products = [];
      let pagination = {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
      };

      if (Array.isArray(payload)) {
        products = payload;
      } else if (Array.isArray(payload?.data)) {
        products = payload.data;
        pagination = payload.pagination || pagination;
      } else if (Array.isArray(payload?.products)) {
        products = payload.products;
        pagination = payload.pagination || pagination;
      }

      return {
        success: true,
        data: products.map((product) => this.transformProduct(product)),
        pagination,
      };
    } catch (error) {
      throw this.normalizeApiError(error, "Failed to fetch products");
    }
  }

  // Get single product by ID
  async getProductById(id) {
    try {
      const response = await get(`/admin/products/${id}`);
      const product = this.extractProduct(response);
      if (!product) {
        throw new Error("Product not found");
      }

      return {
        success: true,
        data: this.transformProduct(product),
      };
    } catch (error) {
      throw this.normalizeApiError(error, "Product not found");
    }
  }

  // Create new product
  async createProduct(productData) {
    try {
      if (!productData.name || !productData.price) {
        throw new Error("Name and price are required");
      }
      const trimmedName = productData.name.trim();
      if (!trimmedName) {
        throw new Error("Name is required");
      }
      const numericPrice = Number(productData.price);
      if (!Number.isFinite(numericPrice) || numericPrice < 0.01) {
        throw new Error("Price must be at least $0.01");
      }
      const numericStock = Number(productData.stock_quantity);
      if (!Number.isInteger(numericStock) || numericStock < 0) {
        throw new Error("Stock must be a non-negative integer");
      }

      const payload = {
        name: trimmedName,
        description: productData.description?.trim() || "",
        price: numericPrice,
        stock: numericStock,
        images: productData.image_url ? [productData.image_url.trim()] : [],
        category: productData.category || null,
        color: productData.color || "Silver",
        material: productData.material?.trim() || null,
        sku: productData.sku?.trim() || null,
        isFeatured: Boolean(productData.is_featured),
        isActive: productData.is_active !== false,
      };

      const response = await post("/admin/products", payload);
      const newProduct = this.extractProduct(response);
      if (!newProduct) {
        throw new Error("Invalid create product response");
      }

      return {
        success: true,
        data: this.transformProduct(newProduct),
        message: response.message || "Product created successfully",
      };
    } catch (error) {
      throw this.normalizeApiError(error, "Failed to create product");
    }
  }

  // Update product
  async updateProduct(id, productData) {
    try {
      // Build payload with only changed fields
      const payload = {};

      if (productData.name !== undefined) {
        const trimmedName = productData.name.trim();
        if (!trimmedName) {
          throw new Error("Name is required");
        }
        payload.name = trimmedName;
      }
      if (productData.description !== undefined) {
        payload.description = productData.description?.trim() || "";
      }
      if (productData.price !== undefined) {
        const numericPrice = Number(productData.price);
        if (!Number.isFinite(numericPrice) || numericPrice < 0.01) {
          throw new Error("Price must be at least $0.01");
        }
        payload.price = numericPrice;
      }
      if (productData.stock_quantity !== undefined) {
        const numericStock = Number(productData.stock_quantity);
        if (!Number.isInteger(numericStock) || numericStock < 0) {
          throw new Error("Stock must be a non-negative integer");
        }
        payload.stock = numericStock;
      }
      if (productData.image_url !== undefined) {
        payload.images = productData.image_url ? [productData.image_url.trim()] : [];
      }
      if (productData.category !== undefined) payload.category = productData.category || null;
      if (productData.color !== undefined) payload.color = productData.color || null;
      if (productData.material !== undefined) {
        payload.material = productData.material?.trim() || null;
      }
      if (productData.sku !== undefined) {
        payload.sku = productData.sku?.trim() || null;
      }
      if (productData.is_featured !== undefined) {
        payload.isFeatured = Boolean(productData.is_featured);
      }
      if (productData.is_active !== undefined) {
        payload.isActive = productData.is_active;
      }

      // Only send if there's data to update
      if (Object.keys(payload).length === 0) {
        throw new Error("No data provided for update");
      }

      const response = await put(`/admin/products/${id}`, payload);
      const updatedProduct = this.extractProduct(response);
      if (!updatedProduct) {
        throw new Error("Invalid update product response");
      }

      return {
        success: true,
        data: this.transformProduct(updatedProduct),
        message: response.message || "Product updated successfully",
      };
    } catch (error) {
      throw this.normalizeApiError(error, "Failed to update product");
    }
  }

  // Delete product
  async deleteProduct(id) {
    try {
      const response = await del(`/admin/products/${id}`);

      return {
        success: true,
        message: response.message || "Product deleted successfully",
      };
    } catch (error) {
      throw this.normalizeApiError(error, "Failed to delete product");
    }
  }

  // Upload product image
  async uploadImage(file, onProgress) {
    try {
      // Validate file
      if (!file) {
        throw new Error("No file provided");
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        throw new Error("Please upload an image file");
      }

      // Check file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        throw new Error("File size must be less than 5MB");
      }

      console.log("📤 Uploading image:", file.name, "Size:", file.size);

      const response = await upload(
        "/upload",
        file,
        {},
        {
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total,
              );
              onProgress(percentCompleted);
            }
          },
        },
      );

      console.log("📥 Upload response:", response);

      // Handle different response formats
      let imageUrl = "";
      if (response.data?.url) {
        imageUrl = response.data.url;
      } else if (response.url) {
        imageUrl = response.url;
      } else if (response.data?.imageUrl) {
        imageUrl = response.data.imageUrl;
      } else if (typeof response === "string") {
        imageUrl = response;
      }

      return {
        success: true,
        data: { url: imageUrl },
        message: "Image uploaded successfully",
      };
    } catch (error) {
      throw this.normalizeApiError(error, "Failed to upload image");
    }
  }

  // Get featured products
  async getFeaturedProducts(limit = 6) {
    try {
      const response = await get("/products/featured", {
        params: { limit: limit.toString() },
      });

      let products = response.data || response || [];

      return {
        success: true,
        data: products.map((product) => this.transformProduct(product)),
      };
    } catch (error) {
      throw this.normalizeApiError(error, "Failed to fetch featured products");
    }
  }

  // Get products by category
  async getProductsByCategory(category, params = {}) {
    try {
      // Format parameters
      const formattedParams = {};

      if (params.page) formattedParams.page = params.page.toString();
      if (params.limit) formattedParams.limit = params.limit.toString();

      const response = await get(`/products/category/${category}`, {
        params: formattedParams,
      });

      let products = response.data || response || [];
      let pagination = response.pagination || {
        page: 1,
        limit: 10,
        total: products.length,
        pages: Math.ceil(products.length / 10),
      };

      return {
        success: true,
        data: products.map((product) => this.transformProduct(product)),
        pagination: pagination,
      };
    } catch (error) {
      throw this.normalizeApiError(error, "Failed to fetch products");
    }
  }

  // Get product statistics
  async getProductStats() {
    try {
      const response = await get("/admin/dashboard");
      return {
        success: true,
        data: response.data?.productStats || response.productStats || {},
      };
    } catch (error) {
      throw this.normalizeApiError(error, "Failed to fetch stats");
    }
  }
}

const productService = new ProductService();
export default productService;
