const mongoose = require('mongoose');

const ShiftSchema = new mongoose.Schema({
  agency: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  location: { 
    type: String, 
    required: true 
  },
  startTime: { 
    type: Date, 
    required: true,
    validate: {
      validator: function(v) {
        return v > new Date();
      },
      message: 'Start time must be in the future.'
    }
  },
  endTime: { 
    type: Date, 
    required: true,
    validate: {
      validator: function(v) {
        return v > this.startTime;
      },
      message: 'End time must be after start time.'
    }
  },
  rate: { 
    type: Number, 
    required: true,
    min: [0, 'Rate cannot be negative.']
  },


  requirements: [{ type: String }],

  
  skillsRequired: [{ type: String, trim: true }],
  credentialsRequired: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Credential'
  }],
  shiftType: {
    type: String,
    enum: ['day', 'night', 'weekend', 'holiday', 'live-in', 'custom'],
    default: 'day'
  },
  experienceLevel: {
    type: String,
    enum: ['entry', 'intermediate', 'senior'],
    default: 'entry'
  },

  assignedDSP: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  status: { 
    type: String, 
    enum: ['open', 'assigned', 'completed', 'cancelled'], 
    default: 'open' 
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  deletedAt: {
    type: Date
  }

}, { timestamps: true });


ShiftSchema.index({ agency: 1 });
ShiftSchema.index({ status: 1, startTime: 1 });
ShiftSchema.index({ assignedDSP: 1 });
ShiftSchema.index({ skillsRequired: 1 });
ShiftSchema.index({ shiftType: 1 });
ShiftSchema.index({ experienceLevel: 1 });


ShiftSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Shift', ShiftSchema);
