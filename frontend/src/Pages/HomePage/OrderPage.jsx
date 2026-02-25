import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import api from "../../api/axios";

export default function OrderPage() {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = cartItems.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0,
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!cartItems.length) {
      setError("Your cart is empty.");
      return;
    }
    if (address.trim().length < 10) {
      setError("Address must be at least 10 characters.");
      return;
    }
    if (phone.trim().length < 10) {
      setError("Phone must be at least 10 characters.");
      return;
    }

    setLoading(true);
    try {
      const guestCart = {
        items: cartItems.map((item) => ({
          productId: String(item.id),
          quantity: Number(item.quantity),
        })),
      };

      await api.post("/cart/merge", { guestCart });

      const res = await api.post("/orders", {
        address: address.trim(),
        phone: phone.trim(),
        notes: notes.trim() || undefined,
      });

      const orderId =
        res?.data?.order?.id ||
        res?.data?.orderId ||
        res?.orderId ||
        res?.order?.id;

      clearCart();
      if (orderId) {
        navigate(`/order-success/${orderId}`);
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Order failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pt-24 pb-12">
      <h1 className="text-3xl font-bold mb-4">Checkout</h1>
      <p className="text-gray-600 mb-6">Total: ${total.toFixed(2)}</p>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Address</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Your full address"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Your phone number"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Notes (optional)
          </label>
          <textarea
            className="w-full rounded-lg border px-3 py-2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any delivery notes"
            rows={3}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Placing order..." : "Place Order"}
        </button>
      </form>
    </div>
  );
}
