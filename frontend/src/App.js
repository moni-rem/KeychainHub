// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/footer";
import UserProtectedRoute from "./components/UserProtectedRoute";

// Pages
import Home from "./Pages/HomePage/Home";
import ProductPage from "./Pages/HomePage/ProductPage";
import ProductDetail from "./Pages/HomePage/ProductDetail";
import CartPage from "./Pages/HomePage/CardPage";
import OrderPage from "./Pages/HomePage/OrderPage";
import UserLogin from "./Pages/HomePage/UserLogin";

// Context
import { CartProvider } from "./context/CartContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { UserAuthProvider } from "./context/UserAuthContext";
import ReviewPage from "./Pages/HomePage/ReviewPage";

function AppContent() {
  const { theme } = useTheme(); 

  return (
    <div className={`min-h-screen ${theme === "light" ? "bg-white text-black" : "bg-black text-white"}`}>
      <UserAuthProvider>
        <CartProvider>
          <Router>
            <Navbar />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<ProductPage />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/contact" element={<ReviewPage />} />

              {/* Protected Routes */}
              <Route
                path="/cart"
                element={
                  <UserProtectedRoute>
                    <CartPage />
                  </UserProtectedRoute>
                }
              />
              <Route
                path="/order"
                element={
                  <UserProtectedRoute>
                    <OrderPage />
                  </UserProtectedRoute>
                }
              />

              {/* Login */}
              <Route path="/login" element={<UserLogin />} />
            </Routes>
            <Footer />
          </Router>
        </CartProvider>
      </UserAuthProvider>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
