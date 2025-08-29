const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  shift: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift', required: true },
  dsp: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  agency: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'completed', 'cancelled'], 
    default: 'pending' 
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


BookingSchema.pre('save', async function(next) {
  const Shift = mongoose.model('Shift');
  const User = mongoose.model('User');

  try {
    
    const existingBooking = await mongoose.model('Booking').findOne({
      shift: this.shift,
      dsp: this.dsp,
      status: { $in: ['pending', 'confirmed'] },
      _id: { $ne: this._id },
      isDeleted: false 
    });

    if (existingBooking) {
      throw new Error('DSP is already booked for this shift.');
    }

  
    const dspUser = await User.findById(this.dsp);
    if (!dspUser || dspUser.role !== 'dsp') {
      throw new Error('Booking DSP must have role "dsp".');
    }

    
    const shift = await Shift.findById(this.shift);
    if (!shift || shift.status !== 'open') {
      throw new Error('Shift is not available for booking.');
    }

    
    if (!dspUser.complianceStatus?.isComplete) {
      throw new Error('DSP compliance requirements not met.');
    }

    next();
  } catch (err) {
    next(err);
  }
});


BookingSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Booking', BookingSchema);
