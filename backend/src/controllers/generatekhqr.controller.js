const crypto = require("crypto");
const db = require("../model");
const adminRealtimeService = require("../services/adminRealtimeService");

const resolveUserId = (req) => String(req.params.id || req.user?.id || "");

const isAuthorizedUser = (req, targetUserId) => {
  if (!req.user) return false;
  return req.user.isAdmin || String(req.user.id) === String(targetUserId);
};

const isPlaceholder = (value = "") => {
  const v = String(value).trim().toLowerCase();
  return (
    !v ||
    v.includes("your_bakong") ||
    v.includes("your business name") ||
    v.includes("your_")
  );
};

const buildDemoKhqrData = ({ userId, orderId, amount, expirationTimestamp }) => {
  const qr = `PAYCHAIN|uid:${userId}|order:${orderId}|amount:${Number(amount).toFixed(2)}|exp:${expirationTimestamp}`;
  const md5 = crypto.createHash("md5").update(qr).digest("hex");
  return { qr, md5, mode: "demo" };
};

const allowDemoMode = () => String(process.env.KHQR_DEMO_MODE || "").toLowerCase() === "true";

const generatekhqr = async (req, res) => {
  const userId = resolveUserId(req);
  const requestedAmount = Number(req.body?.amount || 0.1);
  const amount = Number.isFinite(requestedAmount) && requestedAmount > 0
    ? requestedAmount
    : 0.1;

  try {
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (!isAuthorizedUser(req, userId)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const user = await db.User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    const order = await db.Order.createKhqrOrder({
      userId,
      total: amount,
      status: "pending",
      currency: "USD",
      paymentMethod: "khqr",
      paid: false,
    });

    adminRealtimeService.publish("order.created", {
      orderId: order.id,
      userId,
      total: Number(order.total || 0),
      status: order.status,
      paymentMethod: "khqr",
    });

    const expirationTimestamp = Date.now() + 5 * 60 * 1000;
    let qrPayload = null;
    let bakongGenerationError = null;
    const hasRealBakongConfig =
      !isPlaceholder(process.env.BAKONG_ACCOUNT_USERNAME) &&
      !isPlaceholder(process.env.BAKONG_ACCOUNT_NAME);

    if (hasRealBakongConfig) {
      try {
        const { BakongKHQR, khqrData, IndividualInfo } = require("bakong-khqr");
        const optionalData = {
          currency: khqrData.currency.usd,
          amount: parseFloat(order.total),
          expirationTimestamp,
        };

        const individualInfo = new IndividualInfo(
          process.env.BAKONG_ACCOUNT_USERNAME,
          process.env.BAKONG_ACCOUNT_NAME,
          "PHNOM PENH",
          optionalData,
        );

        const KHQR = new BakongKHQR();
        const qrData = KHQR.generateIndividual(individualInfo);

        if (qrData?.data?.qr && qrData?.data?.md5) {
          qrPayload = {
            qr: qrData.data.qr,
            md5: qrData.data.md5,
            mode: "live",
          };
        }
      } catch (bakongError) {
        bakongGenerationError = bakongError?.message || "Unknown KHQR generation error";
        console.warn("⚠️ KHQR live generation failed:", bakongGenerationError);
      }
    }

    if (!qrPayload) {
      if (!allowDemoMode()) {
        return res.status(503).json({
          success: false,
          message:
            "Unable to generate live KHQR. Check Bakong account credentials or set KHQR_DEMO_MODE=true for demo mode.",
          error: bakongGenerationError || "Live KHQR generation unavailable",
        });
      }

      qrPayload = buildDemoKhqrData({
        userId,
        orderId: order.id,
        amount: order.total,
        expirationTimestamp,
      });
    }

    const updatedOrder = await db.Order.updateById(order.id, {
      currency: "USD",
      qrCode: qrPayload.qr,
      qrMd5: qrPayload.md5,
      qrExpiration: BigInt(expirationTimestamp),
      paymentMethod: "khqr",
      description: qrPayload.mode === "demo" ? "PAYCHAIN_DEMO" : null,
    });

    adminRealtimeService.publish("payment.qr_generated", {
      orderId: updatedOrder.id,
      userId,
      mode: qrPayload.mode,
      amount: Number(updatedOrder.total || 0),
      status: updatedOrder.status,
    });

    return res.status(201).json({
      success: true,
      message:
        qrPayload.mode === "demo"
          ? "KHQR generated in demo mode. Set real Bakong credentials for live payments."
          : "KHQR generated successfully!",
      data: {
        merchant_name: process.env.BAKONG_ACCOUNT_NAME,
        id: updatedOrder.id,
        qr_code: updatedOrder.qrCode,
        qr_md5: updatedOrder.qrMd5,
        amount: updatedOrder.total,
        currency: updatedOrder.currency,
        mode: qrPayload.mode,
        qr_expiration: new Date(
          Number(updatedOrder.qrExpiration),
        ).toISOString(),
      },
    });
  } catch (error) {
    const detail = error?.message || "Unknown KHQR generation error";
    console.error("❌ KHQR generation error:", detail, error);
    return res.status(500).json({
      success: false,
      message: detail,
      error: detail,
    });
  }
};

module.exports = {
  generatekhqr,
};
