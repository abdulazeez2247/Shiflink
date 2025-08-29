const Stripe = require("stripe");
const createError = require("http-errors");

const CURRENCY_CONFIG = {
  USD: { multiplier: 100, symbol: "$", decimal_digits: 2 },
  EUR: { multiplier: 100, symbol: "€", decimal_digits: 2 },
  GBP: { multiplier: 100, symbol: "£", decimal_digits: 2 },
  JPY: { multiplier: 1, symbol: "¥", decimal_digits: 0 },
  CAD: { multiplier: 100, symbol: "CA$", decimal_digits: 2 },
  AUD: { multiplier: 100, symbol: "A$", decimal_digits: 2 }
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20"
});

const normalizeAmount = (amount, currency = "USD") => {
  const config = CURRENCY_CONFIG[currency];
  if (!config) throw createError(400, `Unsupported currency: ${currency}`);
  return Math.round(amount * config.multiplier);
};

const processPayment = async (amount, currency, paymentMethodId, metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: normalizeAmount(amount, currency),
      currency: currency.toLowerCase(),
      payment_method: paymentMethodId,
      confirmation_method: "manual",
      confirm: true,
      metadata
    });

    return {
      paymentId: paymentIntent.id,
      currency,
      amount: paymentIntent.amount,
      status: paymentIntent.status,
      clientSecret: paymentIntent.client_secret
    };
  } catch (err) {
    throw createError(400, "Payment failed", {
      isStripeError: true,
      details: err.raw?.message || err.message
    });
  }
};
const refundPayment = async (paymentId, amount, currency='USD') => {
  const refund = await stripe.refunds.create({
    payment_intent: paymentId,
    amount: normalizeAmount(amount, currency),
  });
  return refund;
};


module.exports = { processPayment, refundPayment, CURRENCY_CONFIG };