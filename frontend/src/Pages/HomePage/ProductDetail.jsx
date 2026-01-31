// src/pages/HomePage/ProductDetail.jsx
import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import products from "../../data/products";
import  { useCart } from "../../context/CartContext"

export default function ProductDetail() {
  const { id } = useParams();
  const product = products.find((p) => Number(p.id) === Number(id));
   const { addToCart } = useCart();

  // ✅ Quantity state
  const [quantity, setQuantity] = useState(1);
  // ✅ Rating state (1-5 stars)
  const [rating, setRating] = useState(0);

  if (!product) {
    return (
      <p className="mt-20 text-center text-red-500 text-xl">
        Product not found
      </p>
    );
  }

  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  const handleStarClick = (value) => setRating(value);

  const relatedProducts = products
    .filter(p => p.id !== product.id)
    .slice(0, 3);

  return (
    
    <div className="max-w-6xl mx-auto mt-24 px-4">

      {/* Product main section */}
      <div className="flex flex-col md:flex-row gap-12">
        {/* Image */}
        <div className="md:w-1/2">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-96 md:h-[500px] object-cover rounded-lg shadow-lg"
          />
        </div>

        {/* Info */}
        <div className="md:w-1/2 flex flex-col justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-4 text-gray-800">
              {product.name}
            </h1>

            {product.price && (
              <p className="text-2xl text-indigo-600 font-bold mb-6">
                ${product.price}
              </p>
            )}

            <p className="text-gray-700 mb-6">
              {product.description ||
                "This is a premium keychain, perfect for gifts or personal use. High-quality and durable, designed for style and functionality."}
            </p>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={decreaseQuantity}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
              >
                -
              </button>
              <span className="px-4 py-2 border rounded">{quantity}</span>
              <button
                onClick={increaseQuantity}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
              >
                +
              </button>
            </div>

            {/* Star Rating */}
            <div className="flex items-center gap-1 mb-6">
              {[1,2,3,4,5].map((star) => (
                <span
                  key={star}
                  onClick={() => handleStarClick(star)}
                  className={`cursor-pointer text-2xl transition ${
                    star <= rating ? "text-yellow-400" : "text-gray-300"
                  }`}
                >
                  ★
                </span>
              ))}
              <span className="ml-2 text-gray-600">{rating} / 5</span>
            </div>
          </div>

         {/* Add to Cart */}
          <button
            onClick={() => addToCart({ ...product, quantity })}
            className="px-8 py-4 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition w-full md:w-auto"
          >
            Add to Cart
          </button>
        </div>
      </div>

      {/* Related Products */}
      <div className="mt-20 mb-16">
        <h2 className="text-3xl font-bold text-gray-700 mb-8 text-center">
          Related Products
        </h2>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {relatedProducts.map((p) => (
            <Link key={p.id} to={`/product/${p.id}`}>
              <div className="border rounded-lg shadow hover:shadow-xl overflow-hidden cursor-pointer transition">
                <img
                  src={p.image}
                  alt={p.name}
                  className="h-60 w-full object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-700 mb-1">
                    {p.name}
                  </h3>
                  {p.price && (
                    <p className="text-indigo-600 font-bold">${p.price}</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
