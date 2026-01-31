import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/footer";

// Pages
import Home from "./Pages/HomePage/Home";
import ProductPage from "./Pages/HomePage/ProductPage";
import ProductDetail from "./Pages/HomePage/ProductDetail";
import CartPage from "./Pages/HomePage/CardPage";
import UserLogin from "./Pages/HomePage/UserLogin";
import OrderPage from "./Pages/HomePage/OrderPage";

// Context
import { CartProvider } from "./context/CartContext";
import { ThemeProvider } from "./context/ThemeContext";
import { UserAuthProvider } from "./context/UserAuthContext";

import UserProtectedRoute from "./components/UserProtectedRoute";

function App() {
  return (
    <UserAuthProvider>
      <CartProvider>
        <ThemeProvider>
          <Router>
            {/* Navbar outside Routes so it's always visible */}
            <Navbar />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<ProductPage />} />
              <Route path="/product/:id" element={<ProductDetail />} />

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
            <Footer/>
          </Router>
        </ThemeProvider>
      </CartProvider>
    </UserAuthProvider>
  );
}

export default App;
