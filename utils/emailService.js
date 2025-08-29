const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, templateId, dynamicData) => {
  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL,
    templateId,
    dynamic_template_data: dynamicData
  };
  await sgMail.send(msg);
};

module.exports = { sendEmail };