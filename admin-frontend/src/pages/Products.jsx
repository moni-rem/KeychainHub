import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Upload,
  X,
  AlertCircle,
  LogOut,
  CheckCircle,
} from "lucide-react";
import { Dialog } from "@headlessui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import productService from "../services/productService";
import { formatCurrency, formatDate } from "../utils/formatters";

// Validation schema
const productSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name too long"),
  description: z.string().max(2000, "Description too long").optional(),
  price: z.coerce.number().min(0.01, "Price must be at least $0.01"),
  stock_quantity: z.number().int().min(0, "Stock must be non-negative"),
  sku: z.string().optional(),
  category: z.string().optional(),
  color: z.string().optional(),
  material: z.string().optional(),
  image_url: z.string().url("Invalid URL").optional().or(z.literal("")),
  is_featured: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

// Categories constant
const CATEGORIES = [
  "Metal",
  "Plastic",
  "Leather",
  "Rubber",
  "Acrylic",
  "Wood",
  "Silicone",
];

// Colors constant
const COLORS = [
  "Silver",
  "Gold",
  "Black",
  "White",
  "Red",
  "Blue",
  "Green",
  "Purple",
  "Orange",
  "Brown",
];

// Detail Item Component
const DetailItem = React.memo(({ label, value }) => (
  <div className="bg-gray-50 p-3 rounded-lg">
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <p className="font-medium text-gray-900">{value}</p>
  </div>
));

DetailItem.displayName = "DetailItem";

function Products() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
    featured: "",
  });

  // Form hook
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      stock_quantity: "",
      sku: "",
      category: "Metal",
      color: "Silver",
      material: "",
      image_url: "",
      is_featured: false,
      is_active: true,
    },
  });

  const imageUrl = watch("image_url");

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = () => {
      // Check multiple token locations
      const token =
        localStorage.getItem("adminToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("jwt");

      const userStr = localStorage.getItem("adminUser");

      console.log("🔐 Auth Check in Products:", {
        hasToken: !!token,
        hasUser: !!userStr,
      });

      // If no token or user, redirect to login
      if (!token || !userStr) {
        console.log("❌ No token or user found in Products");
        toast.error("Please login first");
        navigate("/login", { replace: true });
        return false;
      }

      // Verify user is admin
      try {
        const user = JSON.parse(userStr);
        if (!user?.isAdmin) {
          console.log("❌ User is not admin");
          toast.error("Access denied. Admin only.");
          navigate("/login", { replace: true });
          return false;
        }
        return true;
      } catch (parseError) {
        console.error("❌ Error parsing user data:", parseError);
        // Clear invalid data
        localStorage.removeItem("adminToken");
        localStorage.removeItem("token");
        localStorage.removeItem("jwt");
        localStorage.removeItem("adminUser");
        navigate("/login", { replace: true });
        return false;
      }
    };

    const isValid = checkAuth();
    setIsAuthChecked(isValid);
  }, [navigate]);

  // Handle image URL change for preview
  useEffect(() => {
    setImagePreview(imageUrl || "");
  }, [imageUrl]);

  // Build query params safely
  const getQueryParams = useCallback(() => {
    const params = {
      page: 1,
      limit: 50,
    };

    if (searchQuery?.trim()) {
      params.search = searchQuery.trim();
    }

    if (filters.category) {
      params.category = filters.category;
    }

    if (filters.minPrice) {
      params.minPrice = filters.minPrice;
    }

    if (filters.maxPrice) {
      params.maxPrice = filters.maxPrice;
    }

    if (filters.featured) {
      params.isFeatured = filters.featured;
    }

    return params;
  }, [searchQuery, filters]);

  // Handle unauthorized error
  const handleUnauthorized = useCallback(() => {
    console.log("🔒 Unauthorized access - clearing session");

    // Clear all tokens
    localStorage.removeItem("adminToken");
    localStorage.removeItem("token");
    localStorage.removeItem("jwt");
    localStorage.removeItem("adminUser");

    // Show message
    toast.error("Session expired. Please login again.");

    // Redirect to login
    navigate("/login", { replace: true });
  }, [navigate]);

  // Fetch products - only if authenticated
  const { data, isLoading, refetch, isError, error, isFetching } = useQuery(
    ["products", searchQuery, filters],
    async () => {
      // Double-check token before making request
      const token =
        localStorage.getItem("adminToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("jwt");

      if (!token) {
        throw new Error("No authentication token");
      }

      const params = getQueryParams();
      console.log("🔍 Fetching products with params:", params);
      const response = await productService.getAllProducts(params);
      return response;
    },
    {
      keepPreviousData: true,
      enabled: isAuthChecked,
      retry: 1,
      retryDelay: 1000,
      onError: (err) => {
        console.error("❌ Query error:", err);
        if (err?.status === 401 || err?.message?.includes("401")) {
          handleUnauthorized();
        } else {
          toast.error(err?.message || "Failed to load products");
        }
      },
    },
  );

  // Filter products
  const filteredProducts = useMemo(() => {
    if (!data?.data || !Array.isArray(data.data)) {
      return [];
    }

    return data.data.filter((product) => {
      const matchesSearch =
        !searchQuery ||
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        !filters.category || product.category === filters.category;

      const matchesPrice =
        (!filters.minPrice || product.price >= parseFloat(filters.minPrice)) &&
        (!filters.maxPrice || product.price <= parseFloat(filters.maxPrice));

      const matchesFeatured =
        !filters.featured ||
        (filters.featured === "true" && product.is_featured) ||
        (filters.featured === "false" && !product.is_featured);

      return (
        matchesSearch && matchesCategory && matchesPrice && matchesFeatured
      );
    });
  }, [data?.data, searchQuery, filters]);

  // Create product mutation
  const createMutation = useMutation(
    (productData) => productService.createProduct(productData),
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(["products"]);
        await refetch();
        toast.success(
          <div className="flex items-center gap-2">
            <CheckCircle size={18} />
            <span>Product created successfully</span>
          </div>,
        );
        setIsAddModalOpen(false);
        reset();
        setImagePreview("");
      },
      onError: (error) => {
        console.error("❌ Create error:", error);
        if (error?.status === 401 || error?.message?.includes("401")) {
          handleUnauthorized();
        } else {
          toast.error(error?.message || "Failed to create product");
        }
      },
    },
  );

  // Update product mutation
  const updateMutation = useMutation(
    ({ id, data }) => productService.updateProduct(id, data),
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(["products"]);
        await refetch();
        toast.success(
          <div className="flex items-center gap-2">
            <CheckCircle size={18} />
            <span>Product updated successfully</span>
          </div>,
        );
        setIsEditModalOpen(false);
        setSelectedProduct(null);
        reset();
        setImagePreview("");
      },
      onError: (error) => {
        console.error("❌ Update error:", error);
        if (error?.status === 401 || error?.message?.includes("401")) {
          handleUnauthorized();
        } else {
          toast.error(error?.message || "Failed to update product");
        }
      },
    },
  );

  // Delete product mutation
  const deleteMutation = useMutation((id) => productService.deleteProduct(id), {
    onSuccess: async () => {
      await queryClient.invalidateQueries(["products"]);
      await refetch();
      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle size={18} />
          <span>Product deleted successfully</span>
        </div>,
      );
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
    },
    onError: (error) => {
      console.error("❌ Delete error:", error);
      if (error?.status === 401 || error?.message?.includes("401")) {
        handleUnauthorized();
      } else {
        toast.error(error?.message || "Failed to delete product");
      }
    },
  });

  // Handle logout
  const handleLogout = useCallback(() => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("token");
    localStorage.removeItem("jwt");
    localStorage.removeItem("adminUser");
    localStorage.removeItem("savedEmail");
    localStorage.removeItem("savedPassword");
    localStorage.removeItem("rememberMe");
    toast.success("Logged out successfully");
    navigate("/login", { replace: true });
  }, [navigate]);

  // Event Handlers
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setFilters({
      category: "",
      minPrice: "",
      maxPrice: "",
      featured: "",
    });
  }, []);

  const handleRefresh = useCallback(() => {
    refetch();
    toast.success("Products refreshed");
  }, [refetch]);

  const handleAddProductClick = useCallback(() => {
    reset({
      name: "",
      description: "",
      price: "",
      stock_quantity: "",
      sku: "",
      category: "Metal",
      color: "Silver",
      material: "",
      image_url: "",
      is_featured: false,
      is_active: true,
    });
    setImagePreview("");
    setIsAddModalOpen(true);
  }, [reset]);

  const handleEditClick = useCallback(
    (e, product) => {
      e.preventDefault();
      e.stopPropagation();
      setSelectedProduct(product);

      reset({
        name: product.name || "",
        description: product.description || "",
        price: product.price,
        stock_quantity: product.stock_quantity,
        sku: product.sku || "",
        category: product.category || "Metal",
        color: product.color || "Silver",
        material: product.material || "",
        image_url: product.image_url || "",
        is_featured: product.is_featured || false,
        is_active: product.is_active !== false,
      });

      setImagePreview(product.image_url || "");
      setIsEditModalOpen(true);
    },
    [reset],
  );

  const handleViewClick = useCallback((e, product) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback((e, product) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(
    (e) => {
      e.preventDefault();
      if (selectedProduct) {
        deleteMutation.mutate(selectedProduct.id);
      }
    },
    [selectedProduct, deleteMutation],
  );

  const handleImageUpload = useCallback(
    async (e) => {
      e.preventDefault();
      const file = e.target.files[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      try {
        const response = await productService.uploadImage(file, (progress) => {
          setUploadProgress(progress);
        });

        if (response.success) {
          setValue("image_url", response.data.url);
          toast.success("Image uploaded successfully");
        } else {
          toast.error(response.error || "Failed to upload image");
        }
      } catch (error) {
        console.error("Upload error:", error);
        toast.error(error?.message || "Failed to upload image");
      } finally {
        setUploadProgress(0);
      }
    },
    [setValue],
  );

  const handleModalClose = useCallback(() => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsViewModalOpen(false);
    setIsDeleteModalOpen(false);
    reset();
    setImagePreview("");
    setSelectedProduct(null);
  }, [reset]);

  // Show loading while checking auth
  if (!isAuthChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Failed to load products
          </h3>
          <p className="text-gray-500 mb-4">{error?.message}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 mt-1">
            Total: {data?.pagination?.total || 0} products
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isFetching}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={20} className={isFetching ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleAddProductClick}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={20} />
            Add Product
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors ml-2"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4 flex-wrap">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          <select
            value={filters.category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Min Price"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange("minPrice", e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 w-32"
            min="0"
            step="0.01"
          />

          <input
            type="number"
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 w-32"
            min="0"
            step="0.01"
          />

          <select
            value={filters.featured}
            onChange={(e) => handleFilterChange("featured", e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Products</option>
            <option value="true">Featured Only</option>
            <option value="false">Non-Featured</option>
          </select>

          <button
            onClick={handleClearFilters}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No products found
          </h3>
          <p className="text-gray-500">
            {searchQuery
              ? "Try adjusting your search"
              : "Click 'Add Product' to create your first product"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 group"
            >
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://placehold.co/400x300/e2e8f0/64748b?text=No+Image&font=montserrat";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <ImageIcon
                        size={48}
                        className="text-gray-400 mx-auto mb-2"
                      />
                      <span className="text-sm text-gray-500">No Image</span>
                    </div>
                  </div>
                )}
                {product.is_featured && (
                  <span className="absolute top-2 right-2 bg-yellow-400 text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    Featured
                  </span>
                )}
                {!product.is_active && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    Inactive
                  </span>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3
                      className="font-semibold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer"
                      onClick={(e) => handleViewClick(e, product)}
                    >
                      {product.name}
                    </h3>
                    {product.sku && (
                      <p className="text-xs text-gray-500 mt-1">
                        SKU: {product.sku}
                      </p>
                    )}
                  </div>
                  <span className="text-lg font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                    {formatCurrency(product.price)}
                  </span>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2 mb-3 h-10">
                  {product.description || "No description"}
                </p>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm flex items-center gap-1">
                    <span className="text-gray-500">Stock:</span>
                    <span className="font-medium text-gray-900">
                      {product.stock_quantity}
                    </span>
                  </span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full font-medium ${
                      product.stock_quantity > 20
                        ? "bg-green-100 text-green-800"
                        : product.stock_quantity > 0
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {product.stock_quantity > 20
                      ? "In Stock"
                      : product.stock_quantity > 0
                        ? "Low Stock"
                        : "Out of Stock"}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                  <span className="bg-gray-100 px-2 py-1 rounded-full">
                    {product.category || "Uncategorized"}
                  </span>
                  {product.color && (
                    <span className="bg-gray-100 px-2 py-1 rounded-full flex items-center gap-1">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: product.color.toLowerCase() }}
                      />
                      {product.color}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={(e) => handleViewClick(e, product)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={(e) => handleEditClick(e, product)}
                    className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit Product"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={(e) => handleDeleteClick(e, product)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Product"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Product Modal */}
      <Dialog
        open={isAddModalOpen || isEditModalOpen}
        onClose={handleModalClose}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <form
              onSubmit={handleSubmit((data) => {
                if (isAddModalOpen) {
                  createMutation.mutate(data);
                } else {
                  if (!selectedProduct?.id) {
                    toast.error("No product selected for update");
                    return;
                  }
                  updateMutation.mutate({ id: selectedProduct.id, data });
                }
              })}
            >
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <Dialog.Title className="text-xl font-semibold">
                  {isAddModalOpen ? "Add New Product" : "Edit Product"}
                </Dialog.Title>
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Product Name */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("name")}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter product name"
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      {...register("description")}
                      rows="3"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter product description"
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price ($) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      {...register("price", { valueAsNumber: true })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                    {errors.price && (
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.price.message}
                      </p>
                    )}
                  </div>

                  {/* Stock */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      {...register("stock_quantity", { valueAsNumber: true })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                    {errors.stock_quantity && (
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.stock_quantity.message}
                      </p>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      {...register("category")}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color
                    </label>
                    <select
                      {...register("color")}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {COLORS.map((color) => (
                        <option key={color} value={color}>
                          {color}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Material */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Material
                    </label>
                    <input
                      {...register("material")}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Stainless Steel"
                    />
                  </div>

                  {/* SKU */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SKU
                    </label>
                    <input
                      {...register("sku")}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., KC-001"
                    />
                  </div>

                  {/* Image URL */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        {...register("image_url")}
                        className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://example.com/image.jpg"
                      />
                      <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors">
                        <Upload size={20} />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {errors.image_url && (
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.image_url.message}
                      </p>
                    )}
                  </div>

                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Preview:
                      </p>
                      <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://placehold.co/128/e2e8f0/64748b?text=Error";
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Upload Progress */}
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="col-span-2">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-500 mt-1 text-center">
                        Uploading... {uploadProgress}%
                      </p>
                    </div>
                  )}

                  {/* Checkboxes */}
                  <div className="col-span-2 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register("is_featured")}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        Featured Product
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register("is_active")}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Active</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={
                    createMutation.isLoading || updateMutation.isLoading
                  }
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    createMutation.isLoading ||
                    updateMutation.isLoading ||
                    isSubmitting
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex items-center gap-2 transition-colors"
                >
                  {(createMutation.isLoading || updateMutation.isLoading) && (
                    <Loader2 size={16} className="animate-spin" />
                  )}
                  {isAddModalOpen ? "Create Product" : "Update Product"}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* View Modal */}
      <Dialog
        open={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-lg w-full max-w-2xl">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <Dialog.Title className="text-xl font-semibold">
                Product Details
              </Dialog.Title>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {selectedProduct && (
              <div className="p-6">
                <div className="flex gap-6 mb-6">
                  <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {selectedProduct.image_url ? (
                      <img
                        src={selectedProduct.image_url}
                        alt={selectedProduct.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://placehold.co/128/e2e8f0/64748b?text=No+Image";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon size={32} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {selectedProduct.name}
                    </h3>
                    <p className="text-2xl font-bold text-blue-600 mt-2">
                      {formatCurrency(selectedProduct.price)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {selectedProduct.is_featured && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          Featured
                        </span>
                      )}
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          selectedProduct.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {selectedProduct.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <DetailItem
                    label="Description"
                    value={selectedProduct.description || "No description"}
                  />
                  <DetailItem
                    label="Category"
                    value={selectedProduct.category || "Uncategorized"}
                  />
                  <DetailItem
                    label="Stock"
                    value={`${selectedProduct.stock_quantity} units`}
                  />
                  <DetailItem
                    label="SKU"
                    value={selectedProduct.sku || "Not set"}
                  />
                  <DetailItem
                    label="Color"
                    value={selectedProduct.color || "Not set"}
                  />
                  <DetailItem
                    label="Material"
                    value={selectedProduct.material || "Not set"}
                  />
                  <DetailItem
                    label="Created"
                    value={formatDate(selectedProduct.created_at)}
                  />
                  <DetailItem
                    label="Last Updated"
                    value={formatDate(selectedProduct.updated_at)}
                  />
                </div>
              </div>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Delete Modal */}
      <Dialog
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                <AlertCircle className="text-red-600" size={24} />
              </div>

              <Dialog.Title className="text-lg font-semibold text-center mb-2">
                Delete Product
              </Dialog.Title>

              <p className="text-gray-600 text-center mb-2">
                Are you sure you want to delete "{selectedProduct?.name}"?
              </p>
              <p className="text-sm text-gray-500 text-center mb-6">
                This action cannot be undone.
              </p>

              {selectedProduct?.sku && (
                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  <p className="text-xs text-gray-500">
                    SKU: {selectedProduct.sku}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={deleteMutation.isLoading}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleteMutation.isLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 flex items-center justify-center gap-2 transition-colors"
                >
                  {deleteMutation.isLoading && (
                    <Loader2 size={16} className="animate-spin" />
                  )}
                  Delete
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}

export default Products;
