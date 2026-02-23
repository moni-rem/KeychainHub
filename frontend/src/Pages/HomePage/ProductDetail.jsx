// src/pages/HomePage/ProductDetail.jsx
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { useCart } from "../../context/CartContext";

const API_BASE = "http://localhost:5000";

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError("");

      try {
        // Your backend detail response is likely:
        // { success: true, data: { product: {...} } }
        const res = await axios.get(`${API_BASE}/api/products/${id}`);
        const fetched = res.data?.data?.product;

        if (!fetched) {
          setProduct(null);
          setRelatedProducts([]);
          return;
        }

        const imagePath = fetched.images?.[0]; // "/uploads/products/xxx.jpg"
        const productWithImage = {
          ...fetched,
          imageUrl: imagePath ? `${API_BASE}${imagePath}` : "/no-image.png",
        };

        setProduct(productWithImage);

        // Fetch related products (from list endpoint)
        const allRes = await axios.get(`${API_BASE}/api/products`);
        const list = allRes.data?.data?.products ?? [];

        const related = (Array.isArray(list) ? list : [])
          .filter((p) => p.id !== fetched.id)
          .slice(0, 3)
          .map((p) => {
            const img = p.images?.[0];
            return {
              ...p,
              imageUrl: img ? `${API_BASE}${img}` : "/no-image.png",
            };
          });

        setRelatedProducts(related);
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setProduct(null);
        setRelatedProducts([]);
        setError(
          err?.response?.status
            ? `API error: ${err.response.status}`
            : "Cannot connect to backend (is server running on port 5000?)"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <p className="mt-20 text-center">Loading product...</p>;

  if (!product) {
    return (
      <div className="mt-20 text-center">
        <p className="text-red-500 text-xl font-semibold">Product not found</p>
        {error && <p className="mt-2 text-sm text-gray-600">{error}</p>}
      </div>
    );
  }

  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  return (
    <div className="max-w-6xl mx-auto mt-24 px-4">
      {error && (
        <p className="mb-4 text-center text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex flex-col md:flex-row gap-12">
        <div className="md:w-1/2">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-96 md:h-[500px] object-cover rounded-lg shadow-lg"
            onError={(e) => {
              e.currentTarget.src = "/no-image.png";
            }}
          />
        </div>

        <div className="md:w-1/2 flex flex-col justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-4 text-gray-800">{product.name}</h1>
            <p className="text-2xl text-indigo-600 font-bold mb-6">${product.price}</p>
            <p className="text-gray-700 mb-6">{product.description}</p>

            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={decreaseQuantity}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                -
              </button>
              <span className="px-4 py-2 border rounded">{quantity}</span>
              <button
                onClick={increaseQuantity}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={() => addToCart({ ...product, quantity })}
            className="px-8 py-4 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition w-full md:w-auto"
          >
            Add to Cart
          </button>
        </div>
      </div>

      <div className="mt-20 mb-16">
        <h2 className="text-3xl font-bold text-gray-700 mb-8 text-center">
          Related Products
        </h2>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {relatedProducts.map((p) => (
            <Link key={p.id} to={`/product/${p.id}`}>
              <div className="border rounded-lg shadow hover:shadow-xl overflow-hidden cursor-pointer transition">
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="h-60 w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/no-image.png";
                  }}
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-700 mb-1">
                    {p.name}
                  </h3>
                  <p className="text-indigo-600 font-bold">${p.price}</p>
                </div>
              </div>
            </Link>
          ))}

          {relatedProducts.length === 0 && (
            <p className="col-span-full text-center text-gray-500">
              No related products.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
