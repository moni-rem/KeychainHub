const express = require("express"); // why need to import express
require("dotenv").config(); // to use .env file for environment variables
const { connectDB, disconnectDB } = require("./config/db.js");
const { notFound, errorHandler } = require("./middleware/errorHandler.js");

// import Routes
const productRoutes = require("./routes/productRoutes.js");
const authRoutes = require("./routes/authRoutes.js");
const cartRoutes = require("./routes/cartRoutes.js");

connectDB(); // connect to database

const app = express(); // use app variable to create server name

//body parsing middlewares
//this part is use to parse the data that we send to the body such as (json, urlencoded)
app.use(express.json()); // to parse json data in the body
app.use(express.urlencoded({ extended: true })); // to parse urlencoded data in the body

// this part is for product routes that u import from productRoutes.js
// API Routes
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
// the result wil show when u access to localhost:5001/products/hello in postman or browser

// Root route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Keychain Shop API",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      products: "/api/products",
      auth: "/api/auth",
      cart: "/api/cart",
    },
  });
});

// Simple health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Keychain Shop API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

module.exports = app;
