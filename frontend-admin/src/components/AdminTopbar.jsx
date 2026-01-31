import { useTheme } from "../context/ThemeContext";
import { useAdminAuth } from "../context/AdminAuthContext";

export default function AdminTopbar() {
  const { theme, toggleTheme } = useTheme();
  const { admin, logout } = useAdminAuth();

  return (
    <div className="flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-900">
      <div>Welcome, {admin?.email}</div>
      <div className="flex items-center gap-4">
        <button onClick={toggleTheme} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          {theme === "light" ? "Dark Mode" : "Light Mode"}
        </button>
        <button onClick={logout} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
          Logout
        </button>
      </div>
    </div>
  );
}
