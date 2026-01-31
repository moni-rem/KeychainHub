// Pages/HomePage/OrderPage.jsx
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";

export default function OrderPage() {
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();

  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handlePlaceOrder = () => {
    alert("Order placed successfully!");
    clearCart();
    navigate("/");
  };

  if (cartItems.length === 0) {
    return (
      <p className="mt-20 text-center text-xl">No items in your cart to order.</p>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-24 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Review Your Order</h1>

      <div className="space-y-4">
        {cartItems.map(item => (
          <div key={item.id} className="flex justify-between border p-4 rounded shadow">
            <p>{item.name} x {item.quantity}</p>
            <p>${(item.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
      </div>

      <p className="text-right text-xl font-bold mt-4">Total: ${total.toFixed(2)}</p>

      <div className="mt-6 flex justify-between">
        <button
          onClick={() => navigate("/cart")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md transition"
        >
          Back to Cart
        </button>
        <button
          onClick={handlePlaceOrder}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow-md transition"
        >
          Place Order
        </button>
      </div>
    </div>
  );
}
