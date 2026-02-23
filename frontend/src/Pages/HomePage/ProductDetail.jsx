// src/pages/HomePage/ProductDetail.jsx
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { useCart } from "../../context/CartContext";

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/products/${id}`);
        const fetchedProduct = res.data;

        // Fix image URL if needed
        if (fetchedProduct.image && !fetchedProduct.image.startsWith("http")) {
          fetchedProduct.image = `http://localhost:5000/uploads/${fetchedProduct.image}`;
        }

        setProduct(fetchedProduct);

        // Fetch related products
        const allRes = await axios.get("http://localhost:5000/api/products");
        const related = allRes.data
          .filter(p => (p._id || p.id) !== (fetchedProduct._id || fetchedProduct.id))
          .map(p => ({
            ...p,
            image: p.image?.startsWith("http") ? p.image : `http://localhost:5000/uploads/${p.image}`
          }))
          .slice(0, 3);

        setRelatedProducts(related);
      } catch (err) {
        console.error("Failed to fetch product:", err.response?.status || err.message);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <p className="mt-20 text-center">Loading product...</p>;
  if (!product) return <p className="mt-20 text-center text-red-500 text-xl">Product not found</p>;

  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  return (
    <div className="max-w-6xl mx-auto mt-24 px-4">
      <div className="flex flex-col md:flex-row gap-12">
        <div className="md:w-1/2">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-96 md:h-[500px] object-cover rounded-lg shadow-lg"
          />
        </div>

        <div className="md:w-1/2 flex flex-col justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-4 text-gray-800">{product.name}</h1>
            <p className="text-2xl text-indigo-600 font-bold mb-6">${product.price}</p>
            <p className="text-gray-700 mb-6">{product.description}</p>

            <div className="flex items-center gap-4 mb-6">
              <button onClick={decreaseQuantity} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">-</button>
              <span className="px-4 py-2 border rounded">{quantity}</span>
              <button onClick={increaseQuantity} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">+</button>
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
        <h2 className="text-3xl font-bold text-gray-700 mb-8 text-center">Related Products</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {relatedProducts.map(p => (
            <Link key={p._id || p.id} to={`/product/${p._id || p.id}`}>
              <div className="border rounded-lg shadow hover:shadow-xl overflow-hidden cursor-pointer transition">
                <img src={p.image} alt={p.name} className="h-60 w-full object-cover" />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-700 mb-1">{p.name}</h3>
                  <p className="text-indigo-600 font-bold">${p.price}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
