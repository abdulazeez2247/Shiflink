const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  type: { 
    type: String, 
    required: true,
    enum: [
      'shift_assigned', 
      'message_received', 
      'payment_processed', 
      'document_expiring', 
      'credential_approved'
    ] 
  },
  message: { 
    type: String, 
    required: true 
  },
  relatedId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: false 
  },
  relatedModel: { 
    type: String, 
    required: false 
  },
  read: { 
    type: Boolean, 
    default: false 
  },
  metadata: { 
    type: mongoose.Schema.Types.Mixed 
  }
}, { timestamps: true });


NotificationSchema.post('save', async function(doc) {
  try {
    const io = require('../socketio').getIO();
    io.to(doc.user.toString()).emit('new_notification', doc);
  } catch (err) {
    console.error('Socket emit failed:', err.message);
  }
});

module.exports = mongoose.model('Notification', NotificationSchema);
