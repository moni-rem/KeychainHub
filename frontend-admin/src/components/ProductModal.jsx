import { useEffect, useState } from "react";

export default function ProductModal({ isOpen, onClose, onSubmit, initialData = null }) {
  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    description: "",
    category: "",
    isFeatured: false,
    images: null, // ✅ FileList
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData?.name || "",
        price: initialData?.price ?? "",
        stock: initialData?.stock ?? "",
        description: initialData?.description || "",
        category: initialData?.category || "",
        isFeatured: !!initialData?.isFeatured,
        images: null,
      });
    } else {
      setForm({
        name: "",
        price: "",
        stock: "",
        description: "",
        category: "",
        isFeatured: false,
        images: null,
      });
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "file" ? files : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // ✅ IMPORTANT: description must be >= 10 chars to pass your validator
    onSubmit({
      ...form,
      price: Number(form.price),
      stock: parseInt(form.stock, 10),
    });

    // Don't auto-close if server fails; let Products.jsx close on success
    // onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6">
        <h2 className="text-2xl font-bold mb-4">
          {initialData ? "Edit Product" : "Add Product"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Product name"
            className="w-full border rounded-lg px-4 py-2"
            required
          />

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description (min 10 chars)"
            className="w-full border rounded-lg px-4 py-2 h-24"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              step="0.01"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="Price"
              className="w-full border rounded-lg px-4 py-2"
              required
            />

            <input
              type="number"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              placeholder="Stock"
              className="w-full border rounded-lg px-4 py-2"
              required
            />
          </div>

          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="Category (must match backend list)"
            className="w-full border rounded-lg px-4 py-2"
          />

          <label className="block text-sm font-medium">Product Images</label>
          <input
            type="file"
            name="images"
            accept="image/*"
            multiple
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2"
          />

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isFeatured"
              checked={form.isFeatured}
              onChange={handleChange}
            />
            Featured
          </label>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {initialData ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
