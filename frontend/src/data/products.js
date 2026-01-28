import { useEffect, useMemo, useState } from "react";
import products from "../../data/products";

import { load, save } from "../../components/admin/storage";

const LS_KEY = "admin_products_v1";
const products = getProducts().filter(p => p.status === "active");

const emptyForm = {
  id: "",
  name: "",
  price: "",
  stock: "",
  category: "Acrylic",
  status: "active",
  image: "",
};

function uid() {
  return "p" + Math.random().toString(16).slice(2);
}

export default function Products() {
  const [products, setProducts] = useState(() => load(LS_KEY, mockProducts));
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all/active/hidden
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => save(LS_KEY, products), [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products
      .filter((p) => (statusFilter === "all" ? true : p.status === statusFilter))
      .filter((p) => (q ? p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) : true));
  }, [products, query, statusFilter]);

  const lowStockCount = useMemo(
    () => products.filter((p) => Number(p.stock) <= 5).length,
    [products]
  );

  function openAdd() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setOpen(true);
  }

  function openEdit(p) {
    setEditingId(p.id);
    setForm({
      id: p.id,
      name: p.name,
      price: String(p.price),
      stock: String(p.stock),
      category: p.category,
      status: p.status,
      image: p.image || "",
    });
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
    setForm({ ...emptyForm });
    setEditingId(null);
  }

  function handleSave(e) {
    e.preventDefault();

    const clean = {
      id: editingId ? editingId : uid(),
      name: form.name.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      category: form.category.trim(),
      status: form.status,
      image: form.image.trim() || "https://via.placeholder.com/80",
    };

    if (!clean.name || Number.isNaN(clean.price) || Number.isNaN(clean.stock)) return;

    if (editingId) {
      setProducts((prev) => prev.map((p) => (p.id === editingId ? clean : p)));
    } else {
      setProducts((prev) => [clean, ...prev]);
    }
    closeModal();
  }

  function remove(id) {
    if (!window.confirm("Delete this product?")) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  function toggleStatus(id) {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: p.status === "active" ? "hidden" : "active" } : p
      )
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-gray-500">Low stock (≤ 5): {lowStockCount}</p>
        </div>

        <div className="flex gap-2">
          <input
            className="border rounded-lg px-3 py-2 w-60"
            placeholder="Search name/category..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="border rounded-lg px-3 py-2"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="hidden">Hidden</option>
          </select>

          <button
            onClick={openAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold"
          >
            + Add Product
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left p-3">Product</th>
              <th className="text-left p-3">Category</th>
              <th className="text-left p-3">Price</th>
              <th className="text-left p-3">Stock</th>
              <th className="text-left p-3">Status</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-10 h-10 rounded-lg object-cover border"
                    />
                    <div>
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-xs text-gray-500">ID: {p.id}</div>
                    </div>
                  </div>
                </td>
                <td className="p-3">{p.category}</td>
                <td className="p-3">${Number(p.price).toFixed(2)}</td>
                <td className="p-3">
                  <span className={Number(p.stock) <= 5 ? "text-red-600 font-semibold" : ""}>
                    {p.stock}
                  </span>
                </td>
                <td className="p-3">
                  <span
                    className={
                      p.status === "active"
                        ? "px-2 py-1 rounded-full bg-green-100 text-green-700"
                        : "px-2 py-1 rounded-full bg-gray-100 text-gray-700"
                    }
                  >
                    {p.status}
                  </span>
                </td>
                <td className="p-3 text-right space-x-2">
                  <button
                    onClick={() => openEdit(p)}
                    className="px-3 py-1 rounded-lg border hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => toggleStatus(p.id)}
                    className="px-3 py-1 rounded-lg border hover:bg-gray-50"
                  >
                    {p.status === "active" ? "Hide" : "Activate"}
                  </button>
                  <button
                    onClick={() => remove(p.id)}
                    className="px-3 py-1 rounded-lg border text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td className="p-6 text-center text-gray-500" colSpan={6}>
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{editingId ? "Edit Product" : "Add Product"}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-900">
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Name</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full border rounded-lg px-3 py-2 mt-1"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Stock</label>
                  <input
                    type="number"
                    className="w-full border rounded-lg px-3 py-2 mt-1"
                    value={form.stock}
                    onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600">Category</label>
                  <select
                    className="w-full border rounded-lg px-3 py-2 mt-1"
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  >
                    <option>Acrylic</option>
                    <option>Metal</option>
                    <option>Custom</option>
                    <option>Leather</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Status</label>
                  <select
                    className="w-full border rounded-lg px-3 py-2 mt-1"
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  >
                    <option value="active">active</option>
                    <option value="hidden">hidden</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600">Image URL (optional)</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  value={form.image}
                  onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                  placeholder="https://..."
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
