// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./Pages/HomePage/Home";
import ProductPage from "./Pages/HomePage/productPage";

function App() {
  return (
    <Router>        {/* <-- This is required for Link to work */}
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductPage />} />
      </Routes>
    </Router>
  );
}

export default App;
