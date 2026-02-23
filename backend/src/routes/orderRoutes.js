const express = require("express");
const {
  createOrder,
  getUserOrders,
  getOrder,
  cancelOrder,
  generateInvoice,
  paymentWebhook,
} = require("../controllers/orderController.js");
const { authMiddleware } = require("../middleware/authMiddleware.js");
const { validateRequest } = require("../middleware/validateRequest.js");
const { validateQuery } = require("../middleware/validateQuery.js");
const {
  createOrderSchema,
  orderQuerySchema,
} = require("../validators/orderValidator.js");

const router = express.Router();

// All order routes require authentication
router.use(authMiddleware);

// Order operations
router.post("/", validateRequest(createOrderSchema), createOrder);

router.get("/", validateQuery(orderQuerySchema), getUserOrders);

router.get("/:id", getOrder);

router.put("/:id/cancel", cancelOrder);

router.get("/:id/invoice", generateInvoice);

// Payment webhook (public route for payment providers)
router.post("/webhook/payment", paymentWebhook);

module.exports = router;
