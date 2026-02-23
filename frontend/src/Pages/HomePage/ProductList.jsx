import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:5000";

export default function ProductList({ limit = 8, title = "Latest Products" }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await axios.get(`${API}/api/products`, { params: { limit } });

      const list = res?.data?.data?.data || [];
      const finalList = Array.isArray(list) ? list.slice(0, limit) : [];

      setProducts(finalList);
    } catch (err) {
      console.log(" Fetch products error:", err);
      setError(err?.response?.data?.message || err.message || "Network error");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (loading) return <div className="p-4">Loading products...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex items-end justify-between mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>

        <Link to="/shop" className="text-sm opacity-70 hover:opacity-100">
          View all →
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="opacity-70">No products found.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {products.map((p) => {
            const img = p.images?.[0] ? `${API}${p.images[0]}` : "/no-image.png";

            return (
              <Link
                key={p.id}
                to={`/product/${p.id}`}
                className="rounded-xl border border-white/10 bg-white/5 overflow-hidden hover:shadow-lg transition"
              >
                <img
                  src={img}
                  alt={p.name}
                  className="w-full h-40 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/no-image.png";
                  }}
                />

                <div className="p-3">
                  <div className="font-semibold line-clamp-1">{p.name}</div>
                  <div className="text-sm opacity-70 mt-1">
                    ${Number(p.price).toFixed(2)}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
