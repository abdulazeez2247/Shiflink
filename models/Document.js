const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'ownerModel' 
  },
  ownerModel: {
    type: String,
    required: true,
    enum: ['DSP', 'Agency', 'Trainer', 'County', 'Admin'] 
  },
  title: {
    type: String,
    required: [true, 'Document title is required'],
    trim: true
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL is required']
  },
  fileType: {
    type: String,
    enum: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'],
    required: [true, 'File type is required']
  },
  issuedBy: {
    type: String,
    trim: true
  },
  issueDate: {
    type: Date
  },
  expiryDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['valid', 'expired', 'pending_review', 'rejected'],
    default: 'pending_review'
  },
  documentType: {
    type: String,
    enum: ['contract', 'id', 'agreement', 'policy', 'resume', 'other'],
    default: 'other'
  },
  notes: {
    type: String,
    trim: true
  }
}, { timestamps: true });


DocumentSchema.pre('save', function(next) {
  if (this.expiryDate && new Date() > this.expiryDate) {
    this.status = 'expired';
  }
  next();
});

module.exports = mongoose.model('Document', DocumentSchema);
