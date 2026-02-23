import { useState } from "react";
import axios from "axios";
import { useCart } from "../../context/CartContext";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000";

export default function CartPage() {
  const { cartItems, increase, decrease, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    if (!address || address.trim().length < 10) {
      return alert("Address is required (min 10 characters).");
    }
    if (!phone || phone.trim().length < 10) {
      return alert("Phone number is required (min 10 characters).");
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login first.");
        navigate("/login");
        return;
      }

      // ✅ 1) Merge frontend cart into backend cart (DB)
      const guestCart = {
        items: cartItems.map((item) => ({
          productId: String(item.id),           // ✅ cuid/string
          quantity: Number(item.quantity),
        })),
      };

      await axios.post(
        `${API_BASE}/api/cart/merge`,
        { guestCart },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ 2) Create order (backend uses DB cart)
      const res = await axios.post(
        `${API_BASE}/api/orders`,
        { address: address.trim(), phone: phone.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ 3) Clear frontend cart
      if (clearCart) clearCart();

      const orderId =
        res.data?.orderId ||
        res.data?.data?.orderId ||
        res.data?.data?.order?.id ||
        res.data?.data?.order?.orderId;

      if (orderId) navigate(`/order-success/${orderId}`);
      else navigate("/orders");
    } catch (err) {
      console.log("STATUS:", err.response?.status);
      console.log("DATA JSON:", JSON.stringify(err.response?.data, null, 2));
      alert(
        err.response?.data?.message ||
          JSON.stringify(err.response?.data, null, 2) ||
          err.message
      );
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return <p className="mt-20 text-center text-xl">Your cart is empty</p>;
  }

  return (
    <div className="max-w-5xl mx-auto mt-24 px-4 mb-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Your Cart</h1>

      <div className="space-y-6">
        {cartItems.map((item) => {
          const imgSrc = item.image?.startsWith("http")
            ? item.image
            : `${API_BASE}${item.image || ""}`;

          return (
            <div key={item.id} className="flex items-center gap-6 border p-4 rounded-lg shadow">
              <img src={imgSrc} alt={item.name} className="w-24 h-24 object-cover rounded" />

              <div className="flex-1">
                <h2 className="text-xl font-semibold">{item.name}</h2>
                <p className="text-gray-600">${item.price}</p>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={() => decrease(item.id)} className="px-3 py-1 bg-gray-300 rounded">
                  -
                </button>
                <span className="font-semibold">{item.quantity}</span>
                <button onClick={() => increase(item.id)} className="px-3 py-1 bg-gray-300 rounded">
                  +
                </button>
              </div>

              <button
                onClick={() => removeFromCart(item.id)}
                className="px-3 py-1 bg-red-500 text-white rounded"
              >
                Remove
              </button>
            </div>
          );
        })}

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Your full address (min 10 characters)"
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone number (min 10 digits)"
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>
        </div>
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
