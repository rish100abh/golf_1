const prisma = require('../config/db');

const stripeWebhook = async (req, res) => {
  res.json({ received: true });
};

const createPaymentRecord = async (req, res) => {
  try {
    const { session_id, amount, currency, status, payment_status, metadata } = req.body;

    const record = await prisma.paymentTransaction.create({
      data: {
        userId: req.user.id,
        sessionId: session_id,
        amount,
        currency,
        status,
        paymentStatus: payment_status,
        metadata: metadata || {},
      },
    });

    res.json(record);
  } catch (error) {
    console.error('Create payment record error:', error);
    res.status(500).json({ detail: 'Failed to create payment record' });
  }
};

module.exports = {
  stripeWebhook,
  createPaymentRecord,
};