const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { generatekhqr } = require("../controllers/generatekhqr.controller");
const { checkpayment } = require("../controllers/checkpayment.controller");

const router = express.Router();

router.use(authMiddleware);

// Generate KHQR code for order
router.post("/orders/generate_qrcode", generatekhqr);
router.post("/orders/:id/generate_qrcode", generatekhqr);

// Check payment status
router.post("/orders/check_payment", checkpayment);
router.post("/orders/:id/check_payment", checkpayment);

module.exports = router;
