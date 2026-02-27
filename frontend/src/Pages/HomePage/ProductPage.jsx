import { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import productService from "../../services/productService";
import Pagination01 from "../../components/ui/pagination-01";

const PRODUCT_TYPES = [
  "Metal",
  "Plastic",
  "Leather",
  "Rubber",
  "Acrylic",
  "Wood",
  "Silicone",
];

const normalizeCategory = (value = "") =>
  String(value).trim().toLowerCase();

const resolveProductType = (value = "") => {
  const normalized = normalizeCategory(value);
  if (!normalized) return "";
  return (
    PRODUCT_TYPES.find((type) => normalizeCategory(type) === normalized) || ""
  );
};

export default function ProductPage() {
  const ITEMS_PER_PAGE = 8;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // URL query
  const { category: categoryParam } = useParams();
  const [searchParams] = useSearchParams();
  const search = (searchParams.get("search") || "").toLowerCase().trim();
  const rawCategory = categoryParam || searchParams.get("category") || "";
  const category = resolveProductType(rawCategory);

  // UI filters
  const [sortBy, setSortBy] = useState("newest"); // newest | az | za
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = {
        page: 1,
        limit: 100,
      };

      if (category) {
        params.category = category;
      }

      const res = await productService.getAllProducts(params);
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
          ? res
          : [];

      setProducts(Array.isArray(list) ? list : []);
    } catch (err) {
      console.log("Fetch products error:", err);
      setError(err?.response?.data?.message || err.message || "Network error");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [category]);

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

    // category from URL query
    if (category) {
      list = list.filter((p) =>
        normalizeCategory(p.category) === normalizeCategory(category),
      );
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
      list.sort(
        (a, b) =>
          new Date(b.createdAt || b.created_at || 0) -
          new Date(a.createdAt || a.created_at || 0),
      );
    } else if (sortBy === "az") {
      list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (sortBy === "za") {
      list.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
    }

    return list;
  }, [products, search, category, sortBy, minPrice, maxPrice]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)),
    [filteredProducts.length, ITEMS_PER_PAGE],
  );

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredProducts.slice(start, end);
  }, [filteredProducts, currentPage, ITEMS_PER_PAGE]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, category, sortBy, minPrice, maxPrice]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  if (loading) return <p className="mt-24 text-center">Loading products...</p>;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 pt-24 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Shop keychains</h1>

          <div className="mt-3 text-sm text-gray-600 dark:text-gray-300 space-y-1">
            <div>
              Total: <b>{filteredProducts.length}</b> • Page{" "}
              <b>
                {currentPage}/{totalPages}
              </b>
            </div>

            {search && (
              <div>
                Results for: <b>{search}</b> ({filteredProducts.length})
              </div>
            )}

            {category && (
              <div>
                Category: <b>{category}</b>
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
          {paginatedProducts.map((p) => {
            const img = p.images?.[0] || p.image_url || null;

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
                    {(p.isFeatured || p.is_featured) && (
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
                    <div className="text-sm opacity-70">
                      Stock: {p.stock_quantity}
                    </div>
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

      <Pagination01
        page={currentPage}
        onPageChange={setCurrentPage}
        totalItems={filteredProducts.length}
        itemsPerPage={ITEMS_PER_PAGE}
        siblingCount={1}
        showEdges
      />
    </div>
  );
}
