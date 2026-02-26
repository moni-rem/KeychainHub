const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { connectDB } = require("./config/db");
const { errorHandler } = require("./middleware/errorHandler.js");
const env = require("./config/env");

// Import logger
const logger = require("./middleware/logger");

// Import Routes
const productRoutes = require("./routes/productRoutes.js");
const authRoutes = require("./routes/authRoutes.js");
const cartRoutes = require("./routes/cartRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");
const userRoutes = require("./routes/userRoutes");
const khqrRoutes = require("./routes/khqr.routes");

const app = express();

// Connect to database
connectDB();

// ✅ IMPROVED CORS CONFIGURATION
const allowedOrigins = [
  env.FRONTEND_URL,
  env.ADMIN_URL,
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        process.env.NODE_ENV === "development"
      ) {
        callback(null, true);
      } else {
        console.log("❌ Blocked origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    maxAge: 86400, // 24 hours
  }),
);

// Handle preflight requests explicitly
app.options("*", cors());

// Body parsing middleware with increased limits
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ✅ DETAILED LOGGER MIDDLEWARE
app.use((req, res, next) => {
  const start = Date.now();

  // Log request
  console.log(`\n📥 ${req.method} ${req.url}`);
  console.log("Headers:", {
    origin: req.headers.origin,
    authorization: req.headers.authorization
      ? "Bearer [PRESENT]"
      : "Bearer [MISSING]",
    "content-type": req.headers["content-type"],
  });

  if (req.method === "POST" || req.method === "PUT") {
    console.log("Body:", req.body);
  }

  // Log response
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `📤 ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`,
    );
  });

  next();
});

// Use the logger middleware
app.use(logger);

// ✅ DEBUG ENDPOINT - Check server status
app.get("/api/debug", (req, res) => {
  res.json({
    success: true,
    message: "Debug information",
    server: {
      time: new Date().toISOString(),
      uptime: process.uptime(),
      nodeVersion: process.version,
      platform: process.platform,
      memory: process.memoryUsage(),
      cwd: process.cwd(),
    },
    environment: {
      NODE_ENV: env.nodeEnv,
      PORT: env.port,
      FRONTEND_URL: env.FRONTEND_URL,
      ADMIN_URL: env.ADMIN_URL,
    },
    cors: {
      allowedOrigins: allowedOrigins,
      credentials: true,
    },
    database: {
      connected: true,
      url: env.DATABASE_URL ? "[HIDDEN]" : "Not configured",
    },
  });
});

// ✅ CHECK AUTH ENDPOINT
app.get("/api/check-auth", (req, res) => {
  const authHeader = req.headers.authorization;

  res.json({
    success: true,
    message: "Auth check",
    hasAuthHeader: !!authHeader,
    authFormat: authHeader
      ? authHeader.startsWith("Bearer ")
        ? "Bearer token"
        : "Invalid format"
      : "None",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/khqr", khqrRoutes);

// Test route
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Backend is working!",
    timestamp: new Date().toISOString(),
    environment: env.nodeEnv,
    port: env.port,
    cors: {
      origin: req.headers.origin || "No origin",
      allowed: allowedOrigins,
    },
  });
});

// Root route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Keychain Shop API",
    version: "1.0.0",
    environment: env.nodeEnv,
    endpoints: {
      test: "/api/test",
      health: "/api/health",
      debug: "/api/debug",
      checkAuth: "/api/check-auth",
      products: "/api/products",
      auth: "/api/auth",
      cart: "/api/cart",
      admin: "/api/admin",
      khqr: "/api/khqr",
    },
    documentation: "Use /api/debug for server information",
  });
});

// Simple health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Keychain Shop API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    database: "connected",
    uptime: process.uptime(),
    memory: process.memoryUsage().rss,
  });
});

// Error handling middleware (should be last)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`,
    availableRoutes: [
      "/",
      "/api/test",
      "/api/health",
      "/api/debug",
      "/api/check-auth",
      "/api/products",
      "/api/auth",
      "/api/cart",
      "/api/admin",
      "/api/khqr",
    ],
  });
});

module.exports = app;
