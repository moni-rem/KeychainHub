import { useState } from "react";
import axios from "axios";

export default function AddProductForm({ onSuccess }) {
  const [form, setForm] = useState({ name: "", description: "", price: "", stock: "", image: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/api/products", form);
      console.log("Created:", res.data);
      onSuccess && onSuccess(res.data); // refresh dashboard
      setForm({ name: "", description: "", price: "", stock: "", image: "" });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Server error");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 bg-white shadow rounded-lg">
      <h2 className="text-xl font-bold mb-4">Add Product</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}

      <input name="name" placeholder="Name" value={form.name} onChange={handleChange} className="w-full mb-2 p-2 border rounded"/>
      <input name="description" placeholder="Description" value={form.description} onChange={handleChange} className="w-full mb-2 p-2 border rounded"/>
      <input name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} className="w-full mb-2 p-2 border rounded"/>
      <input name="stock" type="number" placeholder="Stock" value={form.stock} onChange={handleChange} className="w-full mb-2 p-2 border rounded"/>
      <input name="image" placeholder="Image URL" value={form.image} onChange={handleChange} className="w-full mb-2 p-2 border rounded"/>

      <button type="submit" disabled={loading} className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition">
        {loading ? "Adding..." : "Add Product"}
      </button>
    </form>
  );
}
