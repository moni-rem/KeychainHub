// src/components/ProductList.jsx
import { Link } from "react-router-dom";

// Temporary data (can be replaced with API fetch later)
import products from "../../data/products";
import { motion } from "framer-motion";

export default function ProductList() {
  if (!Array.isArray(products)) {
    console.error("Products is NOT an array:", products);
    return <p className="mt-10 text-center text-red-500">Product data error</p>;
  }

  return (
    <div className="max-w-7xl mx-auto mt-20 px-4 mb-16">
      <motion.h1
        className="font-bold text-5xl text-center mb-6"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeIn" }}
      >
        GET THE HIGHLIGHT
      </motion.h1>

      {/* Responsive grid with gap-2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
