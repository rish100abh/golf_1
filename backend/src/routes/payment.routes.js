const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth.middleware');
const {
  stripeWebhook,
  createPaymentRecord,
} = require('../controllers/payment.controller');

router.post('/webhook/stripe', stripeWebhook);
router.post('/transactions', authenticateToken, createPaymentRecord);

module.exports = router;