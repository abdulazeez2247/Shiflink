const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  conversationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Conversation', 
    required: true,
    index: true 
  },
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  text: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: [1000, 'Message too long (max 1000 chars)']
  },
  readBy: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }]
}, { timestamps: true });


MessageSchema.post('save', async function(doc) {
  try {
    const io = require('../socketio').getIO();
    const Conversation = mongoose.model('Conversation');
    
    const conversation = await Conversation.findByIdAndUpdate(
      doc.conversationId,
      { lastMessage: doc._id },
      { new: true }
    );

    if (conversation) {
      conversation.participants.forEach(participantId => {
        io.to(participantId.toString()).emit('new_message', {
          conversationId: doc.conversationId,
          message: doc
        });
      });
    }
  } catch (err) {
    console.error('Message post-save error:', err.message);
  }
});

module.exports = mongoose.model('Message', MessageSchema);
