import { useCart } from "../../context/CartContext";

export default function CartPage() {
  const { cartItems, increase, decrease } = useCart();

  if (cartItems.length === 0) {
    return (
      <p className="mt-20 text-center text-xl">
        Your cart is empty 🛒
      </p>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-24 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Your Cart
      </h1>

      <div className="space-y-6">
        {cartItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-6 border p-4 rounded-lg shadow"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-24 h-24 object-cover rounded"
            />

            <div className="flex-1">
              <h2 className="text-xl font-semibold">{item.name}</h2>
              {item.price && (
                <p className="text-gray-600">${item.price}</p>
              )}
            </div>

            {/* Quantity controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => decrease(item.id)}
                className="px-3 py-1 bg-gray-300 rounded"
              >
                -
              </button>
              <span className="font-semibold">{item.quantity}</span>
              <button
                onClick={() => increase(item.id)}
                className="px-3 py-1 bg-gray-300 rounded"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
