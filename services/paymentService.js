const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Payment = require("../models/Payment");
const createError = require("http-errors");


const createPayment = async (paymentMethodId, amount, payerId, payeeId) => {
  try {
    // Convert amount to cents
    const amountInCents = Math.round(amount * 100);

    // Create a PaymentIntent in Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      payment_method: paymentMethodId,
      confirm: true, // Immediately confirm the payment
    });

    // Save payment in DB
    const payment = await Payment.create({
      payer: payerId,
      payee: payeeId,
      amount: amountInCents,
      method: "stripe",
      status: paymentIntent.status === "succeeded" ? "completed" : paymentIntent.status,
      transactionId: paymentIntent.id,
    });

    return payment;
  } catch (err) {
    throw createError(400, "Payment failed", { originalError: err.message });
  }
};


const refundPayment = async (transactionId, amount) => {
  try {
    const refundData = {
      payment_intent: transactionId,
    };

    if (amount) {
      refundData.amount = Math.round(amount * 100);
    }

    const refund = await stripe.refunds.create(refundData);
    return refund;
  } catch (err) {
    throw createError(400, "Refund failed", { originalError: err.message });
  }
};

module.exports = { createPayment, refundPayment };
