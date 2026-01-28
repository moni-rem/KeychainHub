// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/common/Navbar";
import Home from "./Pages/HomePage/Home";
import ProductPage from "./Pages/HomePage/ProductPage";

// ✅ Admin
import AdminLogin from "./Pages/admin/AdminLogin";
import Dashboard from "./Pages/admin/Dashboard";
import Products from "./Pages/admin/Products";
import Orders from "./Pages/admin/Orders";
import Blog from "./Pages/admin/Blog";
import Settings from "./Pages/admin/Settings";

import AdminLayout from "./components/admin/AdminLayout";
import ProtectedRoute from "./components/admin/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* ✅ PUBLIC ROUTES (Navbar included) */}
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <Home />
            </>
          }
        />

        <Route
          path="/product/:id"
          element={
            <>
              <Navbar />
              <ProductPage />
            </>
          }
        />

        {/* ✅ ADMIN LOGIN (No Navbar) */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* ✅ ADMIN AREA (No Navbar, protected) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="blog" element={<Blog />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
