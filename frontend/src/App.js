// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

// Public pages
import Home from "./Pages/HomePage/Home";
import ProductPage from "./Pages/HomePage/ProductPage";
import ProductDetail from "./Pages/HomePage/ProductDetail";
import CartPage from "./Pages/HomePage/CardPage";
import UserLogin from "./Pages/HomePage/UserLogin";


// Context
import { CartProvider } from "./context/CartContext";
import { ThemeProvider } from "./context/ThemeContext";
import { UserAuthProvider } from "./context/UserAuthContext";

// Admin pages
import AdminLogin from "./Pages/admin/AdminLogin";
import Dashboard from "./Pages/admin/Dashboard";
import Products from "./Pages/admin/Products";
import Orders from "./Pages/admin/Orders";
import Blog from "./Pages/admin/Blog";
import Settings from "./Pages/admin/Settings";

import AdminLayout from "./components/admin/AdminLayout";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import UserProtectedRoute from "./components/UserProtectedRoute";


function App() {
  return (
    <div className="bg-white dark:bg-gray-900 text-black dark:text-white min-h-screen">
      <UserAuthProvider>
        <CartProvider>
          <ThemeProvider>
            <Router>
              <Routes>

                {/* 🌍 PUBLIC ROUTES */}
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
                  path="/shop"
                  element={
                    <>
                      <Navbar />
                      <ProductPage />
                    </>
                  }
                />

                <Route
                  path="/product/:id"
                  element={
                    <>
                      <Navbar />
                      <ProductDetail />
                    </>
                  }
                />

                <Route
                  path="/cart"
                  element={
                    <UserProtectedRoute>
                      <Navbar />
                      <CartPage />
                    </UserProtectedRoute>
                  }
                />


                {/* 👤 USER LOGIN */}
                <Route
                  path="/login"
                  element={
                    <>
                      <Navbar />
                      <UserLogin />
                    </>
                  }
                />

                {/* 🔐 ADMIN LOGIN */}
                <Route path="/admin/login" element={<AdminLogin />} />

                {/* 🔒 ADMIN AREA */}
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
          </ThemeProvider>
        </CartProvider>
      </UserAuthProvider>
    </div>
  );
}
export default App;