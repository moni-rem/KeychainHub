const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { adminAuth } = require("../middleware/auth");
const orderValidator = require("../validators/orderValidator");
const { validateQuery } = require("../middleware/validate");

// All admin routes require admin authentication
router.use(adminAuth);

// Dashboard
router.get("/dashboard", adminController.getDashboardStats);

router.get("/analytics", adminController.getSalesAnalytics);

// Orders management
router.get(
  "/orders",
  orderValidator.orderQuery,
  validateQuery,
  adminController.getAllOrders,
);

router.put("/orders/:id/status", adminController.updateOrderStatus);

// Products management
router.get("/products", adminController.getAllProducts);

router.post("/products/bulk", adminController.bulkUpdateProducts);

// Users management
router.get("/users", adminController.getAllUsers);

router.post("/users/bulk-email", adminController.sendBulkEmail);

// System
router.get("/system", adminController.getSystemStats);

router.get("/export", adminController.exportData);

module.exports = router;
