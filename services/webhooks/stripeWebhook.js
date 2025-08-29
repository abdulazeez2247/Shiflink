const stripe = require('../config/stripe');
const createError = require('http-errors');

const handleStripeWebhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody, 
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return next(createError(403, 'Invalid webhook signature'));
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object);
      break;
    case 'payment_intent.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;
  }

  res.status(200).end();
};

const handlePaymentSuccess = async (paymentIntent) => {
  await Payment.findOneAndUpdate(
    { transactionId: paymentIntent.id },
    { status: 'completed' }
  );
};

module.exports = { handleStripeWebhook };