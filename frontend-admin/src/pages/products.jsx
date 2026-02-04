import { useEffect, useState } from "react";
import api from "../api/axios";
import AdminLayout from "../layouts/Adminlayout";
import ProductModal from "../components/ProductModal";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    const interval = setInterval(fetchProducts, 5000); // real-time update every 5s
    return () => clearInterval(interval);
  }, []);

 const handleSubmit = async (data) => {
  try {
    if (editing) {
      // Update existing product
      await api.put(`/products/${editing.id}`, data);
    } else {
      // Add new product
      await api.post("/products", data);
    }
    setOpen(false);        // close modal
    setEditing(null);      // clear editing
    fetchProducts();       // refresh list
  } catch (err) {
    console.error("Save failed:", err);
  }
};


 const handleDelete = async (id) => {
  if (!window.confirm("Delete product?")) return;

  try {
    await api.delete(`/products/${id}`);
    fetchProducts(); // refresh list after deletion
  } catch (err) {
    console.error("Delete failed:", err);
  }
};


  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Products</h2>
        <button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          Add Product
        </button>
      </div>

      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border px-4 py-2 rounded-lg w-64 mb-4"
      />

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-4">{p.name}</td>
                <td className="p-4">${p.price}</td>
                <td className="p-4">{p.stock}</td>
                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => {
                      setEditing(p);
                      setOpen(true);
                    }}
                    className="bg-yellow-400 px-3 py-1 rounded text-white"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="bg-red-500 px-3 py-1 rounded text-white"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ProductModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        initialData={editing}
      />
    </AdminLayout>
  );
}
