import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <div className="flex-1">
        <AdminTopbar />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
