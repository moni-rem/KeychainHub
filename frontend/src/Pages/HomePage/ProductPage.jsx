import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";

export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // URL query: /shop?search=abc
  const [searchParams] = useSearchParams();
  const search = (searchParams.get("search") || "").toLowerCase().trim();

  // UI filters
  const [sortBy, setSortBy] = useState("newest"); // newest | az | za
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/products");
        const updated = res.data.map((p) => ({
          ...p,
          image: p.image?.startsWith("http")
            ? p.image
            : `http://localhost:5000/uploads/${p.image}`,
        }));
        setProducts(updated);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

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

    // price filter (optional)
    // const min = minPrice === "" ? null : Number(minPrice);
    // const max = maxPrice === "" ? null : Number(maxPrice);

    // if (min !== null && !Number.isNaN(min)) {
    //   list = list.filter((p) => Number(p.price || 0) >= min);
    // }
    // if (max !== null && !Number.isNaN(max)) {
    //   list = list.filter((p) => Number(p.price || 0) <= max);
    // }

    // sorting
    if (sortBy === "newest") {
      list.sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));
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
          <h1 className="text-3xl md:text-4xl font-bold">Shop keychains with your favorite one</h1>
          {/* <p className="text-gray-500 dark:text-gray-300 mt-2">
            Browse all keychains and accessories
          </p> */}

          {search && (
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
              Showing results for: <b>{search}</b> ({filteredProducts.length})
            </p>
          )}
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

          {/* <div className="flex gap-2">
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
          </div> */}

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

      {/* Grid */}
      {filteredProducts.length === 0 ? (
        <div className="mt-14 text-center">
          <p className="text-red-500 font-semibold">No products found</p>
          {search && (
            <p className="text-gray-500 mt-2">
              Try a different keyword.
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-10">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="border rounded-xl shadow-sm hover:shadow-lg transition overflow-hidden bg-white dark:bg-gray-900"
            >
              <Link to={`/product/${p.id}`}>
                <img
                  src={p.image}
                  alt={p.name}
                  className="h-64 w-full object-cover"
                />
              </Link>

              <div className="p-4">
                <h2 className="font-bold text-lg line-clamp-1">{p.name}</h2>

                {/* Price if you have it */}
                {p.price != null && (
                  <p className="mt-1 text-gray-700 dark:text-gray-300">
                    ${p.price}
                  </p>
                )}

                <Link
                  to={`/product/${p.id}`}
                  className="mt-4 inline-flex w-full justify-center bg-yellow-100 hover:bg-yellow-200 rounded-lg py-2 font-semibold"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
