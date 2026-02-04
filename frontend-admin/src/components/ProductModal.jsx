import { useEffect, useState } from "react";

export default function ProductModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
}) {
  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    image: "",
    description: "",
  });

  // ✅ Prefill when editing / reset when adding
  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      setForm({
        name: "",
        price: "",
        stock: "",
        image: "",
        description: "",
      });
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    onClose();
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

          <input
            type="number"
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

          <input
            name="image"
            value={form.image}
            onChange={handleChange}
            placeholder="Image URL"
            className="w-full border rounded-lg px-4 py-2"
          />

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            className="w-full border rounded-lg px-4 py-2 h-24"
          />

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
