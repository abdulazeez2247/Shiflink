const mongoose = require('mongoose');

const ComplianceLogSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  action: { 
    type: String, 
    required: true,
    enum: ['credential_uploaded', 'credential_expired', 'document_uploaded', 'document_expired', 'status_updated'] 
  },
  details: { type: String },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },

  
  relatedItem: { 
    type: mongoose.Schema.Types.ObjectId, 
    refPath: 'relatedModel'
  },
  relatedModel: {
    type: String,
    enum: ['Credential', 'Document'],
    required: false
  },

  
  expiryDate: { type: Date },

  
  status: { 
    type: String, 
    enum: ['valid', 'expired', 'pending_review'],
    default: 'valid'
  }
}, { timestamps: true });


ComplianceLogSchema.index({ expiryDate: 1, status: 1 });


ComplianceLogSchema.statics.markExpired = async function () {
  const now = new Date();
  const expiredLogs = await this.find({ expiryDate: { $lte: now }, status: 'valid' });

  for (const log of expiredLogs) {
    log.status = 'expired';
    await log.save();

    
    const Notification = mongoose.model('Notification');
    await Notification.create({
      user: log.user,
      type: 'credential_expired',
      message: `Your ${log.relatedModel.toLowerCase()} has expired.`,
      metadata: { relatedId: log.relatedItem }
    });
  }
};

module.exports = mongoose.model('ComplianceLog', ComplianceLogSchema);
