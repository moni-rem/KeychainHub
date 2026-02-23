// src/components/Sidebar.jsx
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const linkClass =
    "block px-4 py-3 rounded-lg hover:bg-blue-600 hover:text-white transition";

  return (
    <aside className="w-64 bg-white shadow-lg">
      <div className="p-6 text-2xl font-bold text-blue-600">
        Admin Panel
      </div>

      <nav className="px-4 space-y-2 text-gray-700">
        <NavLink to="/admin" className={linkClass}>
          Dashboard
        </NavLink>

        <NavLink to="/admin/products" className={linkClass}>
          Products
        </NavLink>

        <NavLink to="/admin/users" className={linkClass}>
          Users
        </NavLink>
      </nav>
    </aside>
  );
}
