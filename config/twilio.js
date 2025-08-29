const twilio = require('twilio');
const createError = require('http-errors');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);


const sendSMS = async (to, body) => {
  try {
    const message = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to
    });
    return message.sid;
  } catch (err) {
    throw createError(500, 'SMS sending failed', { originalError: err });
  }
};

module.exports = { sendSMS };