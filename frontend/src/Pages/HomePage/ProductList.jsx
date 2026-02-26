import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import productService from "../../services/productService";

export default function ProductList({ limit = 8, title = "Latest Products" }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      console.log("🔄 Fetching products from port 5001...");
      const response = await productService.getAllProducts({ limit });
      console.log("✅ ProductList response:", response);

      if (response.success) {
        // Format products for display
        const formattedProducts = (response.data || []).map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          description: p.description,
          imageUrl: p.image_url || "/no-image.png",
          category: p.category,
        }));

        setProducts(formattedProducts);
      } else {
        setError("Failed to load products");
      }
    } catch (err) {
      console.error("❌ Fetch products error:", err);

      if (
        err.code === "ECONNREFUSED" ||
        err.message?.includes("Network Error")
      ) {
        setError(
          "Cannot connect to server. Please check if backend is running on port 5001.",
        );
      } else {
        setError(
          err?.response?.data?.message ||
            err.message ||
            "Failed to load products",
        );
      }
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="h-8 w-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        <span className="ml-3 text-gray-600">Loading products...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchProducts}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-end justify-between mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Link to="/shop" className="text-sm opacity-70 hover:opacity-100">
          View all →
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-8 opacity-70">No products found.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {products.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-square overflow-hidden bg-gray-100">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/no-image.png";
                  }}
                />
              </div>

              <div className="p-3">
                <h3 className="font-semibold text-gray-900 truncate">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {product.description || "No description"}
                </p>
                <div className="mt-2 font-bold text-blue-600">
                  ${Number(product.price).toFixed(2)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
