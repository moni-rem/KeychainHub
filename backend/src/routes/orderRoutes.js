const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { auth } = require("../middleware/auth");
const orderValidator = require("../validators/orderValidator");
const { validate, validateQuery } = require("../middleware/validate");

// All order routes require authentication
router.use(auth);

// Order operations
router.post(
  "/",
  orderValidator.createOrder,
  validate,
  orderController.createOrder,
);

router.get(
  "/",
  orderValidator.orderQuery,
  validateQuery,
  orderController.getUserOrders,
);

router.get("/:id", orderController.getOrder);

router.put("/:id/cancel", orderController.cancelOrder);

router.get("/:id/invoice", orderController.generateInvoice);

// Payment webhook (public route for payment providers)
router.post("/webhook/payment", orderController.paymentWebhook);

module.exports = router;
