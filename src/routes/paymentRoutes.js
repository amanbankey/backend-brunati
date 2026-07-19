const express = require("express");
const {
  createOrder,
  verifyPayment,
  razorpayWebhook,
} = require("../controllers/paymentController.js");
const authMiddleware = require('../middleware/authMiddleware.js');

const router = express.Router();

router.post("/create-order", authMiddleware, createOrder);
router.post("/verify-payment", verifyPayment);
router.post("/webhook", express.raw({ type: "application/json" }), razorpayWebhook);

module.exports = router;