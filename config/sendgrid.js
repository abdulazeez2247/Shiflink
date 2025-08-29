const sgMail = require('@sendgrid/mail');
const createError = require('http-errors');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);


const sendEmail = async ({ to, subject, text, html }) => {
  try {
    await sgMail.send({
      from: process.env.SENDGRID_FROM_EMAIL,
      to,
      subject,
      text,
      html
    });
  } catch (err) {
    throw createError(500, 'Email sending failed', { originalError: err });
  }
};

module.exports = { sendEmail };