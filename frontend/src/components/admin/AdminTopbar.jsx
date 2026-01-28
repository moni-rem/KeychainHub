import { useNavigate } from "react-router-dom";

export default function AdminTopbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("admin_token");
    navigate("/admin/login");
  };

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
      <div className="font-semibold text-gray-800">Admin Panel</div>
      <button
        onClick={logout}
        className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:opacity-90"
      >
        Logout
      </button>
    </header>
  );
}
