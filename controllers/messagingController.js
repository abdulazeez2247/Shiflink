const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const createError = require('http-errors');

const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate('participants', 'firstName lastName')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (err) {
    next(err);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const { conversationId, text } = req.body;
    const message = await Message.create({
      conversationId,
      sender: req.user._id,
      text
    });

    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
};

const startConversation = async (req, res, next) => {
  try {
    const { participantId } = req.body;
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, participantId] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, participantId]
      });
    }

    res.json(conversation);
  } catch (err) {
    next(err);
  }
};

module.exports = { getConversations, sendMessage, startConversation };