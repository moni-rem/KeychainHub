const express = require("express");
const router = express.Router();

// Import the admin controller
const adminController = require("../controllers/adminController");

// Import middleware
const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateRequest");
const { loginSchema } = require("../validators/authValidators");

// ============= PUBLIC ROUTES (No auth required) =============
// Admin login
router.post("/login", validateRequest(loginSchema), adminController.adminLogin);

// ============= PROTECTED ROUTES (Auth + Admin required) =============
// All routes below this require authentication and admin privileges
router.use(authMiddleware);
router.use(adminMiddleware);

// Admin profile
router.get("/profile", adminController.getAdminProfile);
router.post("/logout", adminController.adminLogout);

// Dashboard - check if method exists
if (typeof adminController.getDashboardStats === "function") {
  router.get("/dashboard", adminController.getDashboardStats);
} else {
  console.warn("⚠️ getDashboardStats method not found in adminController");
  router.get("/dashboard", (req, res) => {
    res
      .status(501)
      .json({ success: false, message: "Dashboard stats not implemented" });
  });
}

// User management - check each method
if (typeof adminController.getAllUsers === "function") {
  router.get("/users", adminController.getAllUsers);
} else {
  console.warn("⚠️ getAllUsers method not found in adminController");
  router.get("/users", (req, res) => {
    res
      .status(501)
      .json({ success: false, message: "Get users not implemented" });
  });
}

if (typeof adminController.getUserById === "function") {
  router.get("/users/:id", adminController.getUserById);
}

if (typeof adminController.updateUser === "function") {
  router.put("/users/:id", adminController.updateUser);
} else {
  console.warn("⚠️ updateUser method not found in adminController");
  router.put("/users/:id", (req, res) => {
    res
      .status(501)
      .json({ success: false, message: "Update user not implemented" });
  });
}

if (typeof adminController.deleteUser === "function") {
  router.delete("/users/:id", adminController.deleteUser);
} else {
  console.warn("⚠️ deleteUser method not found in adminController");
  router.delete("/users/:id", (req, res) => {
    res
      .status(501)
      .json({ success: false, message: "Delete user not implemented" });
  });
}

// Product management
if (typeof adminController.getAllProducts === "function") {
  router.get("/products", adminController.getAllProducts);
}

if (typeof adminController.getProductById === "function") {
  router.get("/products/:id", adminController.getProductById);
}

if (typeof adminController.createProduct === "function") {
  router.post("/products", adminController.createProduct);
}

if (typeof adminController.updateProduct === "function") {
  router.put("/products/:id", adminController.updateProduct);
}

if (typeof adminController.deleteProduct === "function") {
  router.delete("/products/:id", adminController.deleteProduct);
}

// Order management
if (typeof adminController.getAllOrders === "function") {
  router.get("/orders", adminController.getAllOrders);
}

if (typeof adminController.updateOrderStatus === "function") {
  router.put("/orders/:id/status", adminController.updateOrderStatus);
}

// System stats
if (typeof adminController.getSystemStats === "function") {
  router.get("/system-stats", adminController.getSystemStats);
}

// Sales analytics
if (typeof adminController.getSalesAnalytics === "function") {
  router.get("/analytics", adminController.getSalesAnalytics);
}

// Bulk operations
if (typeof adminController.bulkUpdateProducts === "function") {
  router.post("/products/bulk-update", adminController.bulkUpdateProducts);
}

if (typeof adminController.sendBulkEmail === "function") {
  router.post("/users/bulk-email", adminController.sendBulkEmail);
}

// Export data
if (typeof adminController.exportData === "function") {
  router.get("/export", adminController.exportData);
}

// Health check for admin routes
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin routes are working",
    user: req.user ? { id: req.user.id, isAdmin: req.user.isAdmin } : null,
  });
});

module.exports = router;
