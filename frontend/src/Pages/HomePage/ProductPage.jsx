import { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:5000";

export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // URL query
  const [searchParams] = useSearchParams();
  const search = (searchParams.get("search") || "").toLowerCase().trim();

  // UI filters
  const [sortBy, setSortBy] = useState("newest"); // newest | az | za
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await axios.get(`${API_BASE}/api/products`);
      const list = res?.data?.data?.data || [];
      const pg = res?.data?.data?.pagination || null;

      setProducts(Array.isArray(list) ? list : []);
      setPagination(pg);
    } catch (err) {
      console.log("Fetch products error:", err);
      setError(err?.response?.data?.message || err.message || "Network error");
      setProducts([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = useMemo(() => {
    let list = [...products];

    // search
    if (search) {
      list = list.filter((p) => {
        const name = (p.name || "").toLowerCase();
        const desc = (p.description || "").toLowerCase();
        return name.includes(search) || desc.includes(search);
      });
    }

    // price filter
    const min = minPrice === "" ? null : Number(minPrice);
    const max = maxPrice === "" ? null : Number(maxPrice);

    if (min !== null && !Number.isNaN(min)) {
      list = list.filter((p) => Number(p.price || 0) >= min);
    }
    if (max !== null && !Number.isNaN(max)) {
      list = list.filter((p) => Number(p.price || 0) <= max);
    }

    // sorting
    if (sortBy === "newest") {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "az") {
      list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (sortBy === "za") {
      list.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
    }

    return list;
  }, [products, search, sortBy, minPrice, maxPrice]);

  if (loading) return <p className="mt-24 text-center">Loading products...</p>;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 pt-24 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Shop keychains</h1>

          <div className="mt-3 text-sm text-gray-600 dark:text-gray-300 space-y-1">
            {pagination ? (
              <div>
                Total: <b>{pagination.total}</b> • Page{" "}
                <b>
                  {pagination.page}/{pagination.totalPages}
                </b>
              </div>
            ) : (
              <div>
                Showing: <b>{filteredProducts.length}</b>
              </div>
            )}

            {search && (
              <div>
                Results for: <b>{search}</b> ({filteredProducts.length})
              </div>
            )}

            {error && <div className="text-red-600">{error}</div>}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
          >
            <option value="newest">Sort: Newest</option>
            <option value="az">Sort: A → Z</option>
            <option value="za">Sort: Z → A</option>
          </select>

          <div className="flex gap-2">
            <input
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              type="number"
              placeholder="Min $"
              className="border rounded-lg px-3 py-2 w-28 bg-white dark:bg-gray-800"
            />
            <input
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              type="number"
              placeholder="Max $"
              className="border rounded-lg px-3 py-2 w-28 bg-white dark:bg-gray-800"
            />
          </div>

          <button
            onClick={() => {
              setSortBy("newest");
              setMinPrice("");
              setMaxPrice("");
            }}
            className="border rounded-lg px-3 py-2 hover:opacity-80"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Grid (same UI as ProductList) */}
      {filteredProducts.length === 0 ? (
        <div className="mt-14 text-center">
          <p className="text-red-500 font-semibold">No products found</p>
          {search && <p className="text-gray-500 mt-2">Try a different keyword.</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-10">
          {filteredProducts.map((p) => {
            const img = p.images?.[0] ? `${API_BASE}${p.images[0]}` : null;

            return (
              <div
                key={p.id}
                className="rounded-xl border border-white/10 bg-white/5 overflow-hidden hover:shadow-lg transition"
              >
                <Link to={`/product/${p.id}`}>
                  <div className="h-44 bg-black/20">
                    {img ? (
                      <img
                        src={img}
                        alt={p.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-60">
                        No image
                      </div>
                    )}
                  </div>
                </Link>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold line-clamp-1">{p.name}</div>
                    {p.isFeatured && (
                      <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20">
                        Featured
                      </span>
                    )}
                  </div>

                  <div className="text-sm opacity-70 mt-1 line-clamp-2">
                    {p.description}
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="font-bold">${Number(p.price).toFixed(2)}</div>
                    <div className="text-sm opacity-70">Stock: {p.stock}</div>
                  </div>

                  <div className="text-xs opacity-60 mt-2">
                    Category: {p.category || "—"}
                  </div>

                  <Link
                    to={`/product/${p.id}`}
                    className="mt-4 inline-flex w-full justify-center rounded-lg py-2 font-semibold bg-yellow-100 hover:bg-yellow-200 text-black"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
