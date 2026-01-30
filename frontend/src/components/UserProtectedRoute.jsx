import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUserAuth } from "../context/UserAuthContext";

const UserProtectedRoute = ({ children }) => {
  const { user } = useUserAuth();
  const location = useLocation(); // ✅ get current route safely

  return user ? children : <Navigate to="/login" state={{ from: location }} replace />;
};

export default UserProtectedRoute;
