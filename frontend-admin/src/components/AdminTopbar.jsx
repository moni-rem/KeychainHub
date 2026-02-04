// src/components/Topbar.jsx
export default function Topbar() {
  return (
    <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-semibold text-gray-800">
        Admin Dashboard
      </h1>

      <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
        Logout
      </button>
    </header>
  );
}
