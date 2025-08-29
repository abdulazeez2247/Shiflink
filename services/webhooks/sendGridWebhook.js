// webhooks/sendgridWebhook.js
const crypto = require('crypto');
const createError = require('http-errors');
const Notification = require('../models/Notification');

const _verifySendGridSignature = (signature, timestamp, body, publicKey) => {
  const payload = timestamp + body;
  const computedSignature = crypto
    .createHmac('sha256', publicKey)
    .update(payload, 'utf8')
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(computedSignature)
  );
};

const handleSendGridWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-twilio-signature'];
    const timestamp = req.headers['x-twilio-signature'];
    
    if (!_verifySendGridSignature(signature, timestamp, req.rawBody, process.env.SENDGRID_WEBHOOK_PUBLIC_KEY)) {
      throw createError(403, 'Invalid SendGrid signature');
    }

    const events = Array.isArray(req.body) ? req.body : [req.body];
    
    for (const event of events) {
      await Notification.findOneAndUpdate(
        { 'metadata.messageId': event.sg_message_id },
        { 
          status: event.event,
          ...(event.category && { category: event.category }),
          ...(event.url && { clickUrl: event.url })
        }
      );
    }

    res.status(200).end();
  } catch (err) {
    next(err);
  }
};

module.exports = { handleSendGridWebhook };