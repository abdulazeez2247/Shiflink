const { sendSMS } = require("../config/twilio");
const Message = require("../models/Message");
const Notification = require("../models/Notification");
const createError = require("http-errors");

const sendSystemSMS = async (to, body, userId) => {
  try {
    const messageSid = await sendSMS(to, body);

    await Notification.create({
      user: userId,
      type: "sms_sent",
      message: body,
      metadata: { messageSid },
    });

    return messageSid;
  } catch (err) {
    throw createError(500, "Failed to send SMS", { originalError: err });
  }
};

const sendChatMessage = async (conversationId, senderId, text) => {
  try {
    const message = await Message.create({
      conversationId,
      sender: senderId,
      text,
    });

    return message;
  } catch (err) {
    throw createError(500, "Failed to send message", { originalError: err });
  }
};

module.exports = { sendSystemSMS, sendChatMessage };
