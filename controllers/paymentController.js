const Payment = require('../models/Payment');
const { processPayment } = require('../config/stripe');
const createError = require('http-errors');

const createPayment = async (req, res, next) => {
  try {
    const { amount, paymentMethodId, payeeId } = req.body;
    const result = await processPayment(amount, 'USD', paymentMethodId);

    const payment = await Payment.create({
      payer: req.user._id,
      payee: payeeId,
      amount: amount * 100, // Stripe uses cents
      method: 'stripe',
      status: result.status,
      transactionId: result.paymentId
    });

    res.status(201).json(payment);
  } catch (err) {
    next(createError(400, err.message));
  }
};

const getUserPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({
      $or: [{ payer: req.user._id }, { payee: req.user._id }]
    })
      .populate('payer', 'firstName lastName')
      .populate('payee', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (err) {
    next(err);
  }
};

const handleRefund = async (req, res, next) => {
  try {
    // example skeleton refund flow
    const { transactionId } = req.body;

    // TODO: call Stripe refund API
    // const refund = await stripe.refunds.create({ payment_intent: transactionId });

    res.json({ success: true, transactionId });
  } catch (err) {
    next(err);
  }
};

module.exports = { createPayment, getUserPayments, handleRefund };
