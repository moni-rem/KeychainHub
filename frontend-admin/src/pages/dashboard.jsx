// src/pages/Dashboard/Dashboard.jsx
import React from "react";
import { Outlet, Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100">
      <aside className="bg-white w-60 p-6 h-screen float-left shadow-md">
        <h2 className="text-xl font-bold mb-4">Admin Panel</h2>
        <nav className="flex flex-col gap-2">
          <Link className="text-blue-600 hover:underline" to="/dashboard">
            Home
          </Link>
          <Link className="text-blue-600 hover:underline" to="/dashboard/products">
            Products
          </Link>
          <Link className="text-blue-600 hover:underline" to="/dashboard/users">
            Users
          </Link>
        </nav>
      </aside>

      <main className="ml-64 p-6">
        <Outlet />
      </main>
    </div>
  );
}
