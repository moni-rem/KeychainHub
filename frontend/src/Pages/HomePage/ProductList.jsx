// src/pages/HomePage/ProductList.jsx
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";

export default function ProductList() {
  const [products, setProducts] = useState([]);

  const [searchParams] = useSearchParams();
  const search = (searchParams.get("search") || "").toLowerCase();

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products");
      setProducts(res.data); // keep ALL products in state
    } catch (err) {
      console.error("Failed to fetch products:", err.response?.status, err.message);
    }
  };

  useEffect(() => {
    fetchProducts();
    const interval = setInterval(fetchProducts, 5000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Filter by alphabet (search)
  const filteredProducts = products.filter((p) =>
    (p.name || "").toLowerCase().includes(search)
  );

  // ✅ Then show latest 8 from the filtered results
  const latestFilteredProducts = filteredProducts
    .slice()
    .sort((a, b) => (b.id || 0) - (a.id || 0))
    .slice(0, 8);

  return (
    <div className="max-w-7xl mx-auto mt-20 px-4 mb-16">
      {/* Optional: show search result text */}
      {search && (
        <p className="mb-4 text-gray-600">
          Showing results for: <b>{search}</b> ({latestFilteredProducts.length})
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {latestFilteredProducts.map((p) => (
          <Link key={p._id || p.id} to={`/product/${p._id || p.id}`}>
            <div className="border rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-xl transition">
              <img
                src={
                  p.image?.startsWith("http")
                    ? p.image
                    : `http://localhost:5000/uploads/${p.image}`
                }
                alt={p.name}
                className="h-72 w-full object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold">{p.name}</h3>
              </div>
            </div>
          </Link>
        ))}

        {/* If no result */}
        {latestFilteredProducts.length === 0 && (
          <p className="col-span-full text-center text-gray-500 mt-6">
            No products found.
          </p>
        )}
      </div>
    </div>
  );
}
