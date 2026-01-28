// src/components/ProductList.jsx
import { Link } from "react-router-dom";

// Temporary data (can be replaced with API fetch later)
import products from "..//../data/products";

export default function ProductList() {
  if (!Array.isArray(products)) {
    console.error("Products is NOT an array:", products);
    return <p className="mt-10 text-center text-red-500">Product data error</p>;
  }

  return (
    <div className="max-w-7xl mx-auto mt-20 px-4 mb-16">
      <h2 className="text-3xl font-bold text-center mb-12">
        Our Products
      </h2>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link key={product.id} to={`/product/${product.id}`}>
            <div className="border rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-xl transition">
              <img
                src={product.image}
                alt={product.name}
                className="h-72 w-full object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold">{product.name}</h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
