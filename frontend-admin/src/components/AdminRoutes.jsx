// src/components/AdminRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const isAdmin = () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  return token && role === "admin";
};

export default function AdminRoute({ children }) {
  return isAdmin() ? children : <Navigate to="/login" replace />;
}
