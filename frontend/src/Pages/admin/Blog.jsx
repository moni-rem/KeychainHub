import { useEffect, useState } from "react";
import mockBlogs from "../../data/mockBlogs";
import { load, save } from "../../components/admin/storage";

const LS_KEY = "admin_blogs_v1";

function uid() {
  return "b" + Math.random().toString(16).slice(2);
}

export default function Blog() {
  const [posts, setPosts] = useState(() => load(LS_KEY, mockBlogs));
  const [title, setTitle] = useState("");

  useEffect(() => save(LS_KEY, posts), [posts]);

  function add() {
    const t = title.trim();
    if (!t) return;
    setPosts((prev) => [{ id: uid(), title: t, status: "draft", date: new Date().toISOString().slice(0, 10) }, ...prev]);
    setTitle("");
  }

  function toggle(id) {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: p.status === "draft" ? "published" : "draft" } : p))
    );
  }

  function remove(id) {
    if (!window.confirm("Delete this post?")) return;
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Blog</h1>

      <div className="bg-white rounded-2xl shadow border p-4 flex gap-2">
        <input
          className="flex-1 border rounded-lg px-3 py-2"
          placeholder="New post title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button onClick={add} className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold">
          Add
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left p-3">Title</th>
              <th className="text-left p-3">Date</th>
              <th className="text-left p-3">Status</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3 font-semibold">{p.title}</td>
                <td className="p-3">{p.date}</td>
                <td className="p-3">
                  <span className={p.status === "published" ? "px-2 py-1 rounded-full bg-green-100 text-green-700" : "px-2 py-1 rounded-full bg-gray-100 text-gray-700"}>
                    {p.status}
                  </span>
                </td>
                <td className="p-3 text-right space-x-2">
                  <button onClick={() => toggle(p.id)} className="px-3 py-1 rounded-lg border hover:bg-gray-50">
                    {p.status === "draft" ? "Publish" : "Unpublish"}
                  </button>
                  <button onClick={() => remove(p.id)} className="px-3 py-1 rounded-lg border text-red-600 hover:bg-red-50">
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {posts.length === 0 && (
              <tr>
                <td className="p-6 text-center text-gray-500" colSpan={4}>
                  No posts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
