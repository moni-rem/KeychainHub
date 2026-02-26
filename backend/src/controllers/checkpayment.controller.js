const axios = require("axios");
const db = require("../model");

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
    v.includes("your access token") ||
    v.includes("your_")
  );
};

const isDemoModeOrder = (order) => {
  return order?.description === "PAYCHAIN_DEMO";
};

const getBakongConfig = () => {
  const mode = String(
    process.env.BAKONG_MODE || process.env.BAKONG_ENV || "prod",
  )
    .toLowerCase()
    .trim();

  const devUrl =
    process.env.BAKONG_DEV_BASE_API_URL || process.env.BAKNG_DEV_BASE_API_URL;
  const prodUrl = process.env.BAKONG_PROD_BASE_API_URL;

  const useDev = mode === "dev" || mode === "sandbox" || mode === "test";
  return {
    mode: useDev ? "dev" : "prod",
    baseUrl: useDev ? devUrl : prodUrl,
  };
};

const checkpayment = async (req, res) => {
  const userId = resolveUserId(req);
  const qrMd5 = req.body?.qr_md5 || req.body?.qrMd5;

  try {
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (!qrMd5) {
      return res.status(400).json({
        success: false,
        message: "qr_md5 is required",
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

    const order = await db.Order.findByUserIdAndQrMd5(userId, qrMd5);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    if (order.paid && order.status === "paid") {
      return res.status(200).json({
        success: true,
        message: "Payment already confirmed",
        data: {
          id: order.id,
          bakongHash: order.bakongHash,
          paid_at: order.paidAt,
        },
      });
    }

    if (order.qrMd5 !== qrMd5) {
      return res.status(400).json({
        success: false,
        message: "Invalid QR code",
      });
    }

    const isExpired =
      order.qrExpiration && Date.now() > Number(order.qrExpiration);

    const bakong = getBakongConfig();
    const missingBakongConfig =
      isPlaceholder(bakong.baseUrl) ||
      isPlaceholder(process.env.BAKONG_ACCESS_TOKEN);

    if (missingBakongConfig) {
      return res.status(503).json({
        success: false,
        message:
          bakong.mode === "dev"
            ? "Live payment verification is unavailable. Configure BAKONG_DEV_BASE_API_URL (or BAKNG_DEV_BASE_API_URL) and a valid BAKONG_ACCESS_TOKEN."
            : "Live payment verification is unavailable. Configure BAKONG_PROD_BASE_API_URL and a valid BAKONG_ACCESS_TOKEN.",
      });
    }

    if (isDemoModeOrder(order)) {
      if (isExpired) {
        return res.status(400).json({
          success: false,
          message: "QR code has expired.",
        });
      }

      return res.status(404).json({
        success: false,
        message:
          "Payment not found in Bakong system (demo mode). Configure live Bakong credentials to confirm real payment.",
      });
    }

    const response = await axios.post(
      `${bakong.baseUrl}/check_transaction_by_md5`,
      { md5: order.qrMd5 },
      {
        headers: {
          Authorization: `Bearer ${process.env.BAKONG_ACCESS_TOKEN}`,
        },
      },
    );

    const data = response.data;
    const apiCode = String(data?.responseCode ?? data?.code ?? "");
    const apiData = data?.data || data?.responseData || {};
    const txHash =
      apiData?.hash ||
      apiData?.transactionHash ||
      apiData?.txHash ||
      null;
    const paidStatus = String(apiData?.status || apiData?.state || "")
      .toUpperCase()
      .trim();
    const isPaidByCode = apiCode === "0";
    const isPaidByStatus = paidStatus === "PAID" || paidStatus === "SUCCESS";
    const isConfirmed = isPaidByCode || isPaidByStatus;

    if (isConfirmed) {
      const updatedOrder = await db.Order.updateById(order.id, {
        bakongHash: txHash || order.bakongHash || order.qrMd5,
        fromAccountId: apiData.fromAccountId,
        toAccountId: apiData.toAccountId,
        currency: apiData.currency || order.currency,
        total: Number(apiData.amount || order.total),
        description: apiData.description,
        paid: true,
        paidAt: new Date().toISOString(),
        status: "paid",
        transactionId: txHash || order.transactionId || order.qrMd5,
      });

      return res.status(200).json({
        success: true,
        message: "Payment confirmed",
        data: {
          id: updatedOrder.id,
          bakongHash: updatedOrder.bakongHash,
          paid_at: updatedOrder.paidAt,
        },
      });
    }

    if (isExpired) {
      return res.status(400).json({
        success: false,
        message: "QR code has expired.",
      });
    }

    return res.status(404).json({
      success: false,
      message: "Payment not found in Bakong system",
    });
  } catch (error) {
    const detail = error?.message || "Unknown payment check error";
    console.error("❌ Payment check error:", detail, error);

    if (error.response) {
      return res.status(error.response.status || 500).json({
        success: false,
        message: "Bakong API error",
        error: error.response.data,
      });
    }

    return res.status(500).json({
      success: false,
      message: detail,
      error: detail,
    });
  }
};

module.exports = {
  checkpayment,
};
