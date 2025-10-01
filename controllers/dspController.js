// const Shift = require('../models/Shift'); // ✅ Import Shift model
// const Booking = require('../models/Booking');
// const createError = require('http-errors');
// const User = require('../models/User');

// const getAvailableShifts = async (req, res, next) => {
//   try {
//     const { page = 1, limit = 10 } = req.query;
    
//     // ✅ Use Shift model, not shifts variable
//     const shifts = await Shift.find({ 
//       status: 'open', 
//       startTime: { $gt: new Date() }
//     })
//     .populate('agency', 'firstname lastname email')
//     .sort({ startTime: 1 })
//     .limit(limit * 1)
//     .skip((page - 1) * limit);

//     res.json(shifts);
//   } catch (err) {
//     next(err);
//   }
// };

// const getDSPBookings = async (req, res, next) => {
//   try {
//     const bookings = await Booking.find({ dsp: req.user._id })
//       .populate('shift', 'title location startTime endTime rate')
//       .populate('agency', 'firstname lastname email');

//     res.json(bookings);
//   } catch (err) {
//     next(err);
//   }
// };

// const updateAvailability = async (req, res, next) => {
//   try {
//     const { availability } = req.body;
//     await User.findByIdAndUpdate(req.user._id, { availability });
//     res.json({ message: 'Availability updated successfully' });
//   } catch (err) {
//     next(err);
//   }
// };

// module.exports = { getAvailableShifts, getDSPBookings, updateAvailability };
const Shift = require('../models/Shift');
const Booking = require('../models/Booking');
const createError = require('http-errors');
const User = require('../models/User');

// Existing functions...
const getAvailableShifts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const shifts = await Shift.find({ 
      status: 'open', 
      startTime: { $gt: new Date() }
    })
    .populate('agency', 'firstname lastname email')
    .sort({ startTime: 1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    res.json(shifts);
  } catch (err) {
    next(err);
  }
};

const getDSPBookings = async (req, res, next) => {
  try {
    console.log('🔍 Fetching bookings for DSP:', req.user._id);
    
    const bookings = await Booking.find({ 
      dsp: req.user._id,
      isDeleted: { $ne: true }
    })
    .populate('shift', 'title location startTime endTime rate')
    .populate('agency', 'first_name last_name email')  // FIXED: Use underscores
    .populate('dsp', 'first_name last_name email')     // FIXED: Use underscores
    .sort({ createdAt: -1 });

    console.log('✅ Found bookings:', bookings.length);
    
    // Log booking details for debugging
    bookings.forEach((booking, index) => {
      console.log(`Booking ${index + 1}:`, {
        id: booking._id,
        status: booking.status,
        shiftTitle: booking.shift?.title,
        agencyName: booking.agency ? `${booking.agency.first_name} ${booking.agency.last_name}` : 'No agency',
        dspName: booking.dsp ? `${booking.dsp.first_name} ${booking.dsp.last_name}` : 'No DSP'
      });
    });

    res.json(bookings);
  } catch (err) {
    console.error('❌ Error fetching DSP bookings:', err);
    next(err);
  }
};

const updateAvailability = async (req, res, next) => {
  try {
    const { availability } = req.body;
    await User.findByIdAndUpdate(req.user._id, { availability });
    res.json({ message: 'Availability updated successfully' });
  } catch (err) {
    next(err);
  }
};

// NEW: Book a shift
const bookShift = async (req, res, next) => {
  try {
    console.log('📅 Book shift request received:', req.body);
    console.log('👤 User making request:', req.user._id);
    
    const { shiftId } = req.body;
    
    if (!shiftId) {
      console.log('❌ Missing shiftId in request');
      return next(createError(400, 'Shift ID is required'));
    }
    
    // Check if user has DSP role
    if (req.user.role !== 'dsp') {
      console.log('❌ User is not a DSP');
      return next(createError(403, 'Only DSP users can book shifts'));
    }
    
    // REMOVED: Compliance check - allow direct booking
    // if (!req.user.complianceStatus?.isComplete) {
    //   console.log('❌ User compliance not complete');
    //   return next(createError(400, 'Please complete your compliance requirements before booking shifts'));
    // }
    
    // Check if shift exists and is available
    const shift = await Shift.findOne({ 
      _id: shiftId, 
      status: 'open',
      startTime: { $gt: new Date() }
    });
    
    console.log('🔍 Shift found:', shift);
    
    if (!shift) {
      console.log('❌ Shift not available');
      return next(createError(400, 'Shift not available or already taken'));
    }
    
    // Check if user already booked this shift
    const existingBooking = await Booking.findOne({
      shift: shiftId,
      dsp: req.user._id,
      isDeleted: false
    });
    
    console.log('🔍 Existing booking check:', existingBooking);
    
    if (existingBooking) {
      return next(createError(400, 'You have already booked this shift'));
    }
    
    // Create new booking
    const bookingData = {
      shift: shiftId,
      dsp: req.user._id,
      agency: shift.agency,
      status: 'pending'
    };
    
    console.log('💾 Creating booking with data:', bookingData);
    
    const booking = new Booking(bookingData);
    await booking.save();
    console.log('✅ Booking saved successfully');
    
    // Populate the booking for response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('shift', 'title location startTime endTime rate')
      .populate('agency', 'firstname lastname email')
      .populate('dsp', 'first_name last_name email');
    
    console.log('🎉 Booking completed successfully');
    
    res.json({
      message: 'Shift booked successfully',
      booking: populatedBooking
    });
    
  } catch (err) {
    console.error('💥 Error in bookShift:', err);
    next(createError(500, 'Failed to book shift'));
  }
};

// NEW: Cancel a booking
const cancelBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await Booking.findOne({
      _id: bookingId,
      dsp: req.user._id
    });
    
    if (!booking) {
      return next(createError(404, 'Booking not found'));
    }
    
    // Only allow cancellation if shift hasn't started yet
    if (booking.shift.startTime < new Date()) {
      return next(createError(400, 'Cannot cancel a shift that has already started'));
    }
    
    // Update booking status to cancelled
    booking.status = 'cancelled';
    await booking.save();
    
    res.json({ message: 'Booking cancelled successfully' });
    
  } catch (err) {
    next(err);
  }
};

module.exports = { 
  getAvailableShifts, 
  getDSPBookings, 
  updateAvailability, 
  bookShift,  // Export new function
  cancelBooking  // Export new function
};