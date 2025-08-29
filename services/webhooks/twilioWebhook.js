// webhooks/twilioWebhook.js
const crypto = require('crypto');
const createError = require('http-errors');
const Notification = require('../models/Notification');

const _verifyTwilioSignature = (signature, url, params, authToken) => {
  const data = url + Object.keys(params)
    .sort()
    .map(key => key + params[key])
    .join('');
  
  const computedSignature = crypto
    .createHmac('sha1', authToken)
    .update(Buffer.from(data, 'utf-8'))
    .digest('base64');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(computedSignature)
  );
};

const handleTwilioWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-twilio-signature'];
    const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    
    if (!_verifyTwilioSignature(signature, url, req.body, process.env.TWILIO_AUTH_TOKEN)) {
      throw createError(403, 'Invalid Twilio signature');
    }

    const { MessageStatus, MessageSid, ErrorCode } = req.body;

    await Notification.findOneAndUpdate(
      { 'metadata.messageSid': MessageSid },
      { 
        status: MessageStatus,
        ...(ErrorCode && { error: `Twilio error: ${ErrorCode}` })
      }
    );

    res.set('Content-Type', 'text/xml');
    res.status(200).end();
  } catch (err) {
    next(err);
  }
};

module.exports = { handleTwilioWebhook };