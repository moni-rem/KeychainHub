// src/components/ProductCard.jsx
export default function ProductCard({ product }) {
  return (
    <div className="border rounded-lg shadow p-4 hover:shadow-xl transition flex flex-col">
      <img
        src={product.image || "/placeholder.jpg"}
        alt={product.name}
        className="h-48 w-full object-cover rounded"
      />
      <h3 className="text-xl font-semibold mt-3">{product.name}</h3>
      <p className="text-gray-600 mt-1">${product.price}</p>
      <div className="mt-auto flex gap-2">
        <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Edit</button>
        <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Delete</button>
      </div>
    </div>
  );
}
