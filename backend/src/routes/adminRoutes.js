const express = require("express");
const {
  getDashboardStats,
  getSalesAnalytics,
  getAllOrders,
  updateOrderStatus,
  getAllProducts,
  bulkUpdateProducts,
  getAllUsers,
  sendBulkEmail,
  getSystemStats,
  exportData,
} = require("../controllers/adminController.js");
const { authMiddleware } = require("../middleware/authMiddleware.js");
const { validateQuery } = require("../middleware/validateQuery.js");
const { orderQuerySchema } = require("../validators/orderValidator.js");

const router = express.Router();

// All admin routes require admin authentication
router.use(authMiddleware);

// Dashboard
router.get("/dashboard", adminController.getDashboardStats);

router.get("/analytics", adminController.getSalesAnalytics);

// Orders management
router.get("/orders", validateQuery(orderQuerySchema), getAllOrders);

router.put("/orders/:id/status", updateOrderStatus);

// Products management
router.get("/products", getAllProducts);

router.post("/products/bulk", bulkUpdateProducts);

// Users management
router.get("/users", getAllUsers);

router.post("/users/bulk-email", sendBulkEmail);

// System
router.get("/system", getSystemStats);

router.get("/export", exportData);

module.exports = router;
