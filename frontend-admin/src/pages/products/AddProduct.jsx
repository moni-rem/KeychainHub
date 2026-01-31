import { useState } from "react";
import { useProducts } from "..//../context/ProductContext";

export default function AddProduct() {
  const { addProduct } = useProducts();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");

  const handleSubmit = e => {
    e.preventDefault();
    addProduct({ id: Date.now(), name, price: Number(price), image: image || "/placeholder.jpg" });
    setName(""); setPrice(""); setImage("");
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg p-6 bg-white dark:bg-gray-800 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Add Product</h1>
      <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} className="w-full mb-2 p-2 border rounded"/>
      <input type="number" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} className="w-full mb-2 p-2 border rounded"/>
      <input type="text" placeholder="Image URL" value={image} onChange={e => setImage(e.target.value)} className="w-full mb-4 p-2 border rounded"/>
      <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Add Product</button>
    </form>
  );
}
