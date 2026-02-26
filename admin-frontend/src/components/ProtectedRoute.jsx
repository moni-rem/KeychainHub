// src/components/ProtectedRoute.jsx
import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const checkAuth = () => {
      // First check AuthContext state
      if (user && user.isAdmin) {
        setIsAuthenticated(true);
        return;
      }

      setIsAuthenticated(authService.isAuthenticated());
    };

    if (!authLoading) {
      checkAuth();
    }
  }, [location, user, authLoading]);

  if (isAuthenticated === null || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
