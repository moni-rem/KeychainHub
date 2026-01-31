import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";

export default function AdminProtectedRoute({ children }) {
  const { admin } = useAdminAuth();
  if (!admin || admin.role !== "admin") return <Navigate to="/login" replace />;
  return children;
}
