import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { getProducts } from "../../data/store";

export default function ProductPage() {
  const { id } = useParams();

  const product = useMemo(() => {
    const products = getProducts();
    return products.find((p) => p.id === id);
  }, [id]);

  if (!product) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold">Product not found</h2>
        <p className="text-gray-600">This product may be hidden or deleted.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl shadow border p-6 flex gap-6">
        <img
          src={product.image}
          alt={product.name}
          className="w-40 h-40 rounded-xl object-cover border"
        />

        <div className="flex-1">
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <div className="text-gray-500 mt-1">Category: {product.category}</div>

          <div className="text-2xl font-bold mt-4">${Number(product.price).toFixed(2)}</div>

          <div className="mt-2">
            <span className={Number(product.stock) <= 0 ? "text-red-600 font-semibold" : "text-green-700 font-semibold"}>
              {Number(product.stock) <= 0 ? "Out of stock" : `In stock: ${product.stock}`}
            </span>
          </div>

          <button
            className="mt-5 px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-50"
            disabled={Number(product.stock) <= 0}
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}
