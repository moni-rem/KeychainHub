import { NavLink } from "react-router-dom";

export default function AdminSidebar() {
  return (
    <aside className="w-64 bg-gray-200 dark:bg-gray-800 p-6 flex flex-col">
      <h1 className="text-2xl font-bold mb-6">Admin</h1>
      <NavLink to="/admin" className={({isActive}) => isActive ? "font-bold mb-2" : "mb-2"}>Dashboard</NavLink>
      <NavLink to="/admin/products" className={({isActive}) => isActive ? "font-bold mb-2" : "mb-2"}>Products</NavLink>
      <NavLink to="/admin/products/add" className={({isActive}) => isActive ? "font-bold mb-2" : "mb-2"}>Add Product</NavLink>
    </aside>
  );
}
