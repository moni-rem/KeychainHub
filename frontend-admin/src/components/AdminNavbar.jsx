// src/components/Navbar.jsx
// import { FaSun, FaMoon } from "react-icons/fa";

export default function Navbar() {
  return (
    <div className="flex justify-between items-center px-6 py-4 bg-white shadow">
      <h2 className="text-2xl font-bold">Admin Dashboard</h2>
      <div className="flex items-center gap-4">
        <button className="p-2 rounded hover:bg-gray-100"></button>
        <button className="p-2 rounded hover:bg-gray-100"></button>
      </div>
    </div>
  );
}
