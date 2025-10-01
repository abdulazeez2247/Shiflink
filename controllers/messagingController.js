// const Conversation = require('../models/Conversation');
// const Message = require('../models/Message');
// const createError = require('http-errors');

// const getConversations = async (req, res, next) => {
//   try {
//     const conversations = await Conversation.find({ participants: req.user._id })
//       .populate('participants', 'firstName lastName')
//       .populate('lastMessage')
//       .sort({ updatedAt: -1 });

//     res.json(conversations);
//   } catch (err) {
//     next(err);
//   }
// };

// const sendMessage = async (req, res, next) => {
//   try {
//     const { conversationId, text } = req.body;
//     const message = await Message.create({
//       conversationId,
//       sender: req.user._id,
//       text
//     });

//     res.status(201).json(message);
//   } catch (err) {
//     next(err);
//   }
// };

// const startConversation = async (req, res, next) => {
//   try {
//     const { participantId } = req.body;
//     let conversation = await Conversation.findOne({
//       participants: { $all: [req.user._id, participantId] }
//     });

//     if (!conversation) {
//       conversation = await Conversation.create({
//         participants: [req.user._id, participantId]
//       });
//     }

//     res.json(conversation);
//   } catch (err) {
//     next(err);
//   }
// };

// module.exports = { getConversations, sendMessage, startConversation };
// const Conversation = require('../models/Conversation');
// const Message = require('../models/Message');
// const User = require('../models/User');
// const createError = require('http-errors');

// const getConversations = async (req, res, next) => {
//   try {
//     const conversations = await Conversation.find({ participants: req.user._id })
//       .populate('participants', 'firstName lastName role agencyName')
//       .populate('shift', 'title status')
//       .populate({
//         path: 'lastMessage',
//         populate: {
//           path: 'sender',
//           select: 'firstName lastName'
//         }
//       })
//       .sort({ updatedAt: -1 });

//     res.json(conversations);
//   } catch (err) {
//     next(err);
//   }
// };

// const sendMessage = async (req, res, next) => {
//   try {
//     const { conversationId, text } = req.body;
    
//     // Check if conversation exists and user is a participant
//     const conversation = await Conversation.findOne({
//       _id: conversationId,
//       participants: req.user._id
//     });

//     if (!conversation) {
//       throw createError(404, 'Conversation not found');
//     }

//     const message = await Message.create({
//       conversationId,
//       sender: req.user._id,
//       text
//     });

//     // Update conversation with last message
//     await Conversation.findByIdAndUpdate(conversationId, {
//       lastMessage: message._id,
//       updatedAt: new Date()
//     });

//     // Populate the message with sender info
//     const populatedMessage = await Message.findById(message._id)
//       .populate('sender', 'firstName lastName role');

//     res.status(201).json(populatedMessage);
//   } catch (err) {
//     next(err);
//   }
// };

// const startConversation = async (req, res, next) => {
//   try {
//     const { participantId } = req.body;

//     // Check if participant exists
//     const participant = await User.findById(participantId);
//     if (!participant) {
//       throw createError(404, 'Participant not found');
//     }

//     // Check if conversation already exists
//     let conversation = await Conversation.findOne({
//       participants: { $all: [req.user._id, participantId] }
//     }).populate('participants', 'firstName lastName role agencyName');

//     if (!conversation) {
//       // Create new conversation
//       conversation = await Conversation.create({
//         participants: [req.user._id, participantId]
//       });
      
//       // Populate the new conversation
//       conversation = await Conversation.findById(conversation._id)
//         .populate('participants', 'firstName lastName role agencyName');
//     }

//     res.json(conversation);
//   } catch (err) {
//     next(err);
//   }
// };

// const markMessagesAsRead = async (req, res, next) => {
//   try {
//     const { messageIds } = req.body;

//     await Message.updateMany(
//       { 
//         _id: { $in: messageIds },
//         readBy: { $ne: req.user._id }
//       },
//       { $addToSet: { readBy: req.user._id } }
//     );

//     res.json({ message: 'Messages marked as read' });
//   } catch (err) {
//     next(err);
//   }
// };

// module.exports = { 
//   getConversations, 
//   sendMessage, 
//   startConversation,
//   markMessagesAsRead
// };
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const Shift = require('../models/Shift');
const Booking = require('../models/Booking');
const createError = require('http-errors');

// ORIGINAL: General conversation (without shift)
const startConversation = async (req, res, next) => {
  try {
    const { participantId } = req.body;

    // Check if participant exists
    const participant = await User.findById(participantId);
    if (!participant) {
      throw createError(404, 'Participant not found');
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, participantId] },
      shift: { $exists: false } // Only general conversations
    }).populate('participants', 'first_name last_name role agencyName');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, participantId]
      });
      
      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'first_name last_name role agencyName');
    }

    res.json(conversation);
  } catch (err) {
    next(err);
  }
};

// NEW: Start conversation for a specific shift
const startShiftConversation = async (req, res, next) => {
  try {
    const { shiftId, participantId } = req.body;
    const userId = req.user._id;

    // Validate shift exists and user has access
    const shift = await Shift.findOne({
      _id: shiftId,
      $or: [
        { agency: userId },
        { assignedDSP: userId }
      ]
    });

    if (!shift) {
      throw createError(404, 'Shift not found or access denied');
    }

    // Convert to string for comparison
    const validParticipants = [shift.agency.toString()];
    if (shift.assignedDSP) {
      validParticipants.push(shift.assignedDSP.toString());
    }

    if (!validParticipants.includes(participantId)) {
      throw createError(400, 'Participant not associated with this shift');
    }

    // Check if conversation already exists for this shift
    let conversation = await Conversation.findOne({
      shift: shiftId,
      participants: { $all: [userId, participantId] }
    })
    .populate('participants', 'first_name last_name role agencyName')
    .populate('shift', 'title status');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [userId, participantId],
        shift: shiftId
      });
      
      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'first_name last_name role agencyName')
        .populate('shift', 'title status');
    }

    res.json(conversation);
  } catch (err) {
    next(err);
  }
};

// Get conversations - filter by shift if provided
const getConversations = async (req, res, next) => {
  try {
    const { shiftId } = req.query;
    
    let filter = { participants: req.user._id };
    
    if (shiftId) {
      filter.shift = shiftId;
    }

    const conversations = await Conversation.find(filter)
      .populate('participants', 'first_name last_name role agencyName')
      .populate('shift', 'title status startTime endTime')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'first_name last_name'
        }
      })
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (err) {
    next(err);
  }
};

// Get conversations for a specific shift
const getShiftConversations = async (req, res, next) => {
  try {
    const { shiftId } = req.params;
    const userId = req.user._id;

    const shift = await Shift.findOne({
      _id: shiftId,
      $or: [
        { agency: userId },
        { assignedDSP: userId }
      ]
    });

    if (!shift) {
      throw createError(404, 'Shift not found or access denied');
    }

    const conversations = await Conversation.find({
      shift: shiftId,
      participants: userId
    })
    .populate('participants', 'first_name last_name role agencyName')
    .populate('shift', 'title status')
    .populate({
      path: 'lastMessage',
      populate: {
        path: 'sender',
        select: 'first_name last_name'
      }
    })
    .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (err) {
    next(err);
  }
};

// Send message function
const sendMessage = async (req, res, next) => {
  try {
    const { conversationId, text } = req.body;
    
    // Check if conversation exists and user is a participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id
    });

    if (!conversation) {
      throw createError(404, 'Conversation not found');
    }

    const message = await Message.create({
      conversationId,
      sender: req.user._id,
      text
    });

    // Update conversation with last message
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      updatedAt: new Date()
    });

    // Populate the message with sender info
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'first_name last_name role');

    res.status(201).json(populatedMessage);
  } catch (err) {
    next(err);
  }
};

// Mark messages as read
const markMessagesAsRead = async (req, res, next) => {
  try {
    const { messageIds } = req.body;

    await Message.updateMany(
      { 
        _id: { $in: messageIds },
        readBy: { $ne: req.user._id }
      },
      { $addToSet: { readBy: req.user._id } }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (err) {
    next(err);
  }
};
// Add this new function to messagingController.js
const getActiveDSPsForAgency = async (req, res, next) => {
  try {
    const agencyId = req.user._id;
    
    // Get all DSPs who have active bookings with this agency
    const activeBookings = await Booking.find({
      agency: agencyId,
      status: { $in: ['confirmed', 'assigned', 'active'] },
      isDeleted: false
    })
    .populate('dsp', 'first_name last_name email phone')
    .populate('shift', 'title startTime endTime location');
    
    // Format the response
    const activeDSPs = activeBookings.map(booking => ({
      dspId: booking.dsp._id,
      firstName: booking.dsp.first_name,
      lastName: booking.dsp.last_name,
      email: booking.dsp.email,
      phone: booking.dsp.phone,
      shiftId: booking.shift?._id,
      shiftTitle: booking.shift?.title,
      shiftDate: booking.shift?.startTime,
      shiftLocation: booking.shift?.location,
      bookingId: booking._id,
      status: booking.status
    }));
    
    res.json(activeDSPs);
  } catch (err) {
    next(err);
  }
};

module.exports = { 
  getConversations, 
  sendMessage, 
  startConversation,
  startShiftConversation,
  getShiftConversations,
  markMessagesAsRead,
  getActiveDSPsForAgency
};