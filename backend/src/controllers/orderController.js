const orderService = require("../services/orderService");
const emailService = require("../services/emailService");
const paymentService = require("../services/paymentService");
const ApiResponse = require("../utils/apiResponse");
const Helpers = require("../utils/helpers");

class OrderController {
  createOrder = Helpers.asyncHandler(async (req, res) => {
    const order = await orderService.createOrder(req.user.id, req.body);

    // Send order confirmation email
    try {
      await emailService.sendOrderConfirmation(req.user.email, order, req.user);
    } catch (emailError) {
      console.error("Failed to send order confirmation email:", emailError);
      // Don't fail the order if email fails
    }

    // Create payment intent
    let paymentIntent = null;
    try {
      paymentIntent = await paymentService.createPaymentIntent(
        order.total,
        order.id,
      );
    } catch (paymentError) {
      console.error("Failed to create payment intent:", paymentError);
      // Payment is optional for this simulation
    }

    const response = ApiResponse.created("Order created successfully", {
      order,
      ...(paymentIntent && { paymentIntent }),
    });
    response.send(res);
  });

  getUserOrders = Helpers.asyncHandler(async (req, res) => {
    const result = await orderService.getUserOrders(req.user.id, req.query);

    const response = ApiResponse.success(
      "Orders retrieved successfully",
      result,
    );
    response.send(res);
  });

  getOrder = Helpers.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const order = await orderService.getOrderById(req.user.id, id);

    const response = ApiResponse.success("Order retrieved successfully", {
      order,
    });
    response.send(res);
  });

  cancelOrder = Helpers.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;

    // Update order status to cancelled
    const order = await orderService.updateOrderStatus(id, "cancelled");

    // If order was paid, initiate refund
    // This is simplified - in reality, you'd check payment status first
    if (order.total > 0) {
      try {
        await paymentService.refundPayment(`payment_for_${id}`, order.total);
      } catch (refundError) {
        console.error("Refund failed:", refundError);
        // Continue even if refund fails
      }
    }

    const response = ApiResponse.success("Order cancelled successfully", {
      order,
      refundInitiated: order.total > 0,
    });
    response.send(res);
  });

  // Webhook for payment confirmation
  paymentWebhook = Helpers.asyncHandler(async (req, res) => {
    const { eventType, data } = req.body;

    const result = await paymentService.handleWebhookEvent(eventType, data);

    if (result.processed && result.orderId) {
      // Update order status based on payment result
      let newStatus = "pending";
      if (result.status === "paid") {
        newStatus = "processing";
      } else if (result.status === "failed") {
        newStatus = "cancelled";
      }

      try {
        await orderService.updateOrderStatus(result.orderId, newStatus);
      } catch (orderError) {
        console.error("Failed to update order status:", orderError);
      }
    }

    const response = ApiResponse.success("Webhook processed", result);
    response.send(res);
  });

  // Generate invoice for order
  generateInvoice = Helpers.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const order = await orderService.getOrderById(req.user.id, id);

    // Generate simple invoice data
    const invoice = {
      invoiceNumber: `INV-${order.id.slice(0, 8).toUpperCase()}`,
      orderId: order.id,
      date: new Date(order.createdAt).toLocaleDateString(),
      customer: {
        name: req.user.name,
        email: req.user.email,
        ...(req.user.address && { address: req.user.address }),
        ...(req.user.phone && { phone: req.user.phone }),
      },
      items: order.items.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
      })),
      subtotal: order.total,
      tax: 0, // Simplified - no tax calculation
      total: order.total,
      status: order.status,
    };

    const response = ApiResponse.success("Invoice generated", { invoice });
    response.send(res);
  });
}

module.exports = new OrderController();
