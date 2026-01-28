// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./Pages/HomePage/Home";
import Products from "./Pages/HomePage/products";
import ProductDetail from "./Pages/HomePage/ProductDetail";
import BlogApp from './Pages/HomePage/blog';
import { CartProvider } from "./context/CartContext";
import { ThemeProvider } from "./context/ThemeContext";
import CartPage from './Pages/HomePage/CardPage';

function App() {
  return (
     <div className="bg-white dark:bg-gray-900 text-black dark:text-white min-h-screen">
       <ThemeProvider>
    <CartProvider> 
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<BlogApp />} />      
          <Route path="/shop" element={<Products />} />    
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </Router>
    </CartProvider>
    </ThemeProvider>
    </div>
  );
}


export default App;
