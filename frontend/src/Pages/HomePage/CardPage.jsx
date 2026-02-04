import { useState } from "react";
import axios from "axios";
import { useCart } from "../../context/CartContext";
import { Link, useNavigate } from "react-router-dom";

export default function CartPage() {
  const { cartItems, increase, decrease, removeFromCart, clearCart } = useCart(); // ✅ add clearCart if you have it
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    setLoading(true);
    try {
      // If you store logged-in user in localStorage, use it. Otherwise send null.
      const user = JSON.parse(localStorage.getItem("user") || "null");

      const payload = {
        userId: user?.id || null,
        items: cartItems.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      const res = await axios.post("http://localhost:5000/api/orders", payload);

      // Clear cart (best UX)
      if (clearCart) clearCart();

      // Go to order success page (or just alert)
      navigate(`/order-success/${res.data.orderId}`);
    } catch (err) {
      console.error("Checkout failed:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return <p className="mt-20 text-center text-xl">Your cart is empty </p>;
  }

  return (
    <div className="max-w-5xl mx-auto mt-24 px-4 mb-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Your Cart</h1>

      <div className="space-y-6">
        {cartItems.map((item) => (
          <div key={item.id} className="flex items-center gap-6 border p-4 rounded-lg shadow">
            <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded" />

            <div className="flex-1">
              <h2 className="text-xl font-semibold">{item.name}</h2>
              <p className="text-gray-600">${item.price}</p>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => decrease(item.id)} className="px-3 py-1 bg-gray-300 rounded">-</button>
              <span className="font-semibold">{item.quantity}</span>
              <button onClick={() => increase(item.id)} className="px-3 py-1 bg-gray-300 rounded">+</button>
            </div>

            <button onClick={() => removeFromCart(item.id)} className="px-3 py-1 bg-red-500 text-white rounded">
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-between items-center">
        <p className="text-xl font-bold">Total: ${total.toFixed(2)}</p>

        <button
          onClick={handleCheckout}
          disabled={loading}
          className={`px-6 py-2 rounded-lg shadow-md transition text-white ${
            loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? "Placing Order..." : "Place Order"}
        </button>
      </div>

      <div className="mt-6 text-right">
        <Link
          to="/shop"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md transition"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
