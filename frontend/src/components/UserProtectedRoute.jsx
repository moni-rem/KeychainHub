import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUserAuth } from "../context/UserAuthContext";

const UserProtectedRoute = ({ children }) => {
  const { user, token, loading } = useUserAuth();
  const location = useLocation(); // ✅ get current route safely

  if (loading) {
    return <div className="min-h-screen" />;
  }

  return user && token ? (
    children
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default UserProtectedRoute;
