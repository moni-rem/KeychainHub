import { useState } from "react";
import axios from "axios";

export default function OrderPage() {
  const [productId, setProductId] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState(1);

  const handleOrder = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/orders", {
        userId: 1, // later replace with logged-in user id
        items: [
          {
            product_id: Number(productId),
            quantity: Number(quantity),
            price: Number(price),
          },
        ],
      });

      alert("Order placed! Order ID: " + res.data.orderId);
      setProductId("");
      setPrice("");
      setQuantity(1);
    } catch (err) {
      console.error("Order failed:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to place order");
    }
  };

  return (
    <div className="p-6 space-y-3">
      <h1 className="text-2xl font-bold">Place an Order</h1>

      <input
        type="number"
        placeholder="Product ID (ex: 1)"
        value={productId}
        onChange={(e) => setProductId(e.target.value)}
        className="border p-2 w-full"
      />

      <input
        type="number"
        placeholder="Price (ex: 9.99)"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="border p-2 w-full"
      />

      <input
        type="number"
        min={1}
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
        className="border p-2 w-full"
      />

      <button onClick={handleOrder} className="bg-blue-600 text-white px-4 py-2 rounded">
        Order
      </button>
    </div>
  );
}
