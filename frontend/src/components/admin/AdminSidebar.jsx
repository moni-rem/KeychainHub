import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }) =>
  `block px-4 py-2 rounded-lg ${
    isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
  }`;

export default function AdminSidebar() {
  return (
    <aside className="w-64 bg-white border-r min-h-screen p-4">
      <div className="text-xl font-bold mb-6">KeychainHub Admin</div>

      <nav className="space-y-2">
        <NavLink to="/admin" end className={linkClass}>Dashboard</NavLink>
        <NavLink to="/admin/products" className={linkClass}>Products</NavLink>
        <NavLink to="/admin/orders" className={linkClass}>Orders</NavLink>
        <NavLink to="/admin/blog" className={linkClass}>Blog</NavLink>
        <NavLink to="/admin/settings" className={linkClass}>Settings</NavLink>
      </nav>
    </aside>
  );
}
