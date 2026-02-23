import { useEffect, useState } from "react";
import api from "../api/axios";
import AdminLayout from "../layouts/Adminlayout";
import ProductModal from "../components/ProductModal";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");

 const filteredProducts = (Array.isArray(products) ? products : []).filter((p) =>
  (p?.name ?? "").toLowerCase().includes(search.toLowerCase())
);


const fetchProducts = async () => {
  try {
    const res = await api.get("/products"); // ✅ working route
    const list = res?.data?.data?.data || [];
    setProducts(Array.isArray(list) ? list : []);
  } catch (err) {
    console.error("Failed to fetch products:", err);
    setProducts([]);
  }
};


  

  useEffect(() => {
    fetchProducts();
    const interval = setInterval(fetchProducts, 5000); // real-time update every 5s
    return () => clearInterval(interval);
  }, []);

const handleSubmit = async (data) => {
  try {
    // ✅ build multipart/form-data
    const fd = new FormData();
    fd.append("name", data.name || "");
    fd.append("description", data.description || "");
    fd.append("price", String(data.price ?? ""));
    fd.append("stock", String(data.stock ?? ""));
    if (data.category) fd.append("category", data.category);
    fd.append("isFeatured", String(!!data.isFeatured));

    // ✅ support file upload (if exists)
    if (data.images && data.images.length) {
      for (const file of data.images) {
        fd.append("images", file);
      }
    }

    if (editing) {
      await api.put(`/products/${editing.id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } else {
      await api.post("/products", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }

    setOpen(false);
    setEditing(null);
    fetchProducts();
  } catch (err) {
    console.error("Save failed:", err);

    // ✅ print exact backend validation errors
    console.log("Server response:", err?.response?.data);

    alert(
      err?.response?.data?.data?.errors?.map((e) => `${e.field}: ${e.message}`).join("\n") ||
      err?.response?.data?.message ||
      "Save failed"
    );
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
