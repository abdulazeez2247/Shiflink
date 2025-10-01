// const Shift = require('../models/Shift');
// const Booking = require('../models/Booking');
// const Credential = require('../models/Credential'); // Add this import
// const createError = require('http-errors');

// const createShift = async (req, res, next) => {
//   try {
//     const shift = await Shift.create({ ...req.body, agency: req.user._id });
//     res.status(201).json(shift);
//   } catch (err) {
//     next(createError(400, err.message));
//   }
// };

// const getShifts = async (req, res, next) => {
//   try {
//     const { page = 1, limit = 10, status } = req.query;
//     const filter = { isDeleted: false };
//     if (status) filter.status = status;

//     const shifts = await Shift.find(filter)
//       .populate('agency', 'firstName lastName email')
//       .populate('assignedDSP', 'firstName lastName')
//       .sort({ startTime: 1 })
//       .limit(limit * 1)
//       .skip((page - 1) * limit);

//     res.json(shifts);
//   } catch (err) {
//     next(err);
//   }
// };

// // Helper function to check user compliance
// const checkUserCompliance = async (userId) => {
//   // Define required compliance items for DSPs
//   const requiredItems = [
//     'background_check',
//     'insurance_document', 
//     'training_certificate',
//     'license_verification'
//   ];
  
//   // Get user's current approved credentials
//   const userCredentials = await Credential.find({ 
//     owner: userId, 
//     isDeleted: false,
//     status: 'approved'
//   });
  
//   // Check if all required items are present and valid
//   const missingItems = [];
//   const completedItems = [];
  
//   for (const item of requiredItems) {
//     const hasValidCredential = userCredentials.some(cred => {
//       const isTypeMatch = cred.type === item;
//       const isNotExpired = !cred.expiryDate || cred.expiryDate > new Date();
//       return isTypeMatch && isNotExpired;
//     });
    
//     if (hasValidCredential) {
//       completedItems.push(item);
//     } else {
//       missingItems.push(item);
//     }
//   }
  
//   return {
//     isComplete: missingItems.length === 0,
//     completedItems,
//     missingItems,
//     totalRequired: requiredItems.length,
//     completedCount: completedItems.length
//   };
// };

// const bookShift = async (req, res, next) => {
//   try {
//     const { shiftId } = req.params;
//     const userId = req.user._id;
    
//     // Check if user has complete compliance
//     console.log('📋 Checking compliance for user:', userId);
//     const complianceStatus = await checkUserCompliance(userId);
    
//     if (!complianceStatus.isComplete) {
//       console.log('❌ User compliance not complete. Missing:', complianceStatus.missingItems);
//       return res.status(400).json({ 
//         message: 'User compliance not complete',
//         isComplianceIssue: true,
//         missingItems: complianceStatus.missingItems,
//         details: `Please complete the following requirements: ${complianceStatus.missingItems.join(', ')}`
//       });
//     }
    
//     console.log('✅ User compliance complete. Proceeding with shift booking...');
    
//     // Check if shift exists and is available
//     const shift = await Shift.findById(shiftId);
    
//     if (!shift) {
//       throw createError(400, 'Shift not found');
//     }
    
//     if (shift.status !== 'open') {
//       throw createError(400, 'Shift not available for booking');
//     }
    
//     // Check if user has already booked this shift
//     const existingBooking = await Booking.findOne({
//       shift: shiftId,
//       dsp: userId,
//       status: { $in: ['pending', 'confirmed'] }
//     });
    
//     if (existingBooking) {
//       throw createError(400, 'You have already booked this shift');
//     }
    
//     // Create the booking
//     const booking = await Booking.create({
//       shift: shiftId,
//       dsp: userId,
//       agency: shift.agency,
//       status: 'pending'
//     });

//     // Update shift status if needed (optional)
//     // await Shift.findByIdAndUpdate(shiftId, { status: 'pending' });

//     console.log('✅ Shift booked successfully:', booking._id);
//     res.status(201).json(booking);
//   } catch (err) {
//     console.error('❌ Error booking shift:', err.message);
//     next(err);
//   }
// };

// // Add a new endpoint to check compliance status for shifts
// const getShiftComplianceStatus = async (req, res, next) => {
//   try {
//     const complianceStatus = await checkUserCompliance(req.user._id);
    
//     res.json({
//       canBookShifts: complianceStatus.isComplete,
//       complianceStatus: complianceStatus,
//       message: complianceStatus.isComplete 
//         ? 'You are eligible to book shifts' 
//         : `Complete ${complianceStatus.missingItems.length} more requirements to book shifts`
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// module.exports = { 
//   createShift, 
//   getShifts, 
//   bookShift, 
//   getShiftComplianceStatus // Export the new function
// };
const Shift = require('../models/Shift');
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const createError = require('http-errors');

const createShift = async (req, res, next) => {
  try {
    const shift = await Shift.create({ ...req.body, agency: req.user._id });
    res.status(201).json(shift);
  } catch (err) {
    next(createError(400, err.message));
  }
};

const getShifts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const filter = { isDeleted: false };
    if (status) filter.status = status;

    const shifts = await Shift.find(filter)
      .populate('agency', 'first_name last_name email')  // FIXED: Use underscores
      .populate('assignedDSP', 'first_name last_name')   // FIXED: Use underscores
      .sort({ startTime: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json(shifts);
  } catch (err) {
    next(err);
  }
};

const bookShift = async (req, res, next) => {
  try {
    const { shiftId } = req.params;
    const userId = req.user._id;
    
    console.log('📅 Book shift request received:', { shiftId, userId });
    
    // Validate shiftId format
    if (!mongoose.Types.ObjectId.isValid(shiftId)) {
      console.log('❌ Invalid shift ID format');
      return res.status(400).json({ message: 'Invalid shift ID format' });
    }
    
    // Check if shift exists and is available
    const shift = await Shift.findById(shiftId);
    
    console.log('🔍 Shift found:', shift);
    
    if (!shift) {
      console.log('❌ Shift not found');
      return res.status(404).json({ message: 'Shift not found' });
    }
    
    if (shift.status !== 'open') {
      console.log('❌ Shift not available. Status:', shift.status);
      return res.status(400).json({ message: 'Shift not available for booking' });
    }
    
    // Check if user has already booked this shift
    const existingBooking = await Booking.findOne({
      shift: shiftId,
      dsp: userId,
      status: { $in: ['pending', 'confirmed'] }
    });
    
    console.log('🔍 Existing booking check:', existingBooking);
    
    if (existingBooking) {
      console.log('❌ User already booked this shift');
      return res.status(400).json({ message: 'You have already booked this shift' });
    }
    
    // Create the booking
    const booking = await Booking.create({
      shift: shiftId,
      dsp: userId,
      agency: shift.agency,
      status: 'pending'
    });

    console.log('✅ Shift booked successfully:', booking._id);
    
    // Populate the booking with correct field names before sending response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('shift', 'title location startTime endTime rate')
      .populate('agency', 'first_name last_name email')  // FIXED: Use underscores
      .populate('dsp', 'first_name last_name email');    // FIXED: Use underscores

    console.log('📊 Populated booking details:', {
      shiftTitle: populatedBooking.shift?.title,
      agencyName: populatedBooking.agency ? `${populatedBooking.agency.first_name} ${populatedBooking.agency.last_name}` : 'No agency',
      dspName: populatedBooking.dsp ? `${populatedBooking.dsp.first_name} ${populatedBooking.dsp.last_name}` : 'No DSP'
    });

    res.status(201).json(populatedBooking);
  } catch (err) {
    console.error('❌ Error booking shift:', err.message);
    console.error('💥 Error stack:', err.stack);
    
    // Provide more specific error messages
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error: ' + err.message });
    }
    if (err.message.includes('already booked')) {
      return res.status(400).json({ message: err.message });
    }
    
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { createShift, getShifts, bookShift };
// const Shift = require('../models/Shift');
// const Booking = require('../models/Booking');
// const createError = require('http-errors');

// // Create a new shift (for agency)
// const createShift = async (req, res, next) => {
//   try {
//     const shift = await Shift.create({ ...req.body, agency: req.user._id });
//     res.status(201).json(shift);
//   } catch (err) {
//     next(createError(400, err.message));
//   }
// };

// // Get all shifts with optional pagination and status filter
// const getShifts = async (req, res, next) => {
//   try {
//     const { page = 1, limit = 10, status } = req.query;
//     const filter = { isDeleted: false };
//     if (status) filter.status = status;

//     const shifts = await Shift.find(filter)
//       .populate('agency', 'firstName lastName email')
//       .populate('assignedDSP', 'firstName lastName')
//       .sort({ startTime: 1 })
//       .limit(limit * 1)
//       .skip((page - 1) * limit);

//     res.json(shifts);
//   } catch (err) {
//     next(err);
//   }
// };

// // Book a shift (bypassing compliance checks)
// const bookShift = async (req, res, next) => {
//   try {
//     const { shiftId } = req.params;
//     const userId = req.user._id; // auth middleware must populate req.user

//     console.log('📅 Book shift request received:', { shiftId, userId });

//     // Find the shift
//     const shift = await Shift.findById(shiftId);
//     if (!shift) throw createError(404, 'Shift not found');

//     // Check if shift is open
//     if (shift.status !== 'open') {
//       throw createError(400, 'Shift not available for booking');
//     }

//     // Check if DSP has already booked this shift
//     const existingBooking = await Booking.findOne({
//       shift: shiftId,
//       dsp: userId,
//       status: { $in: ['pending', 'confirmed'] }
//     });

//     if (existingBooking) {
//       throw createError(400, 'You have already booked this shift');
//     }

//     // Create booking without compliance checks
//     const booking = await Booking.create({
//       shift: shiftId,
//       dsp: userId,
//       agency: shift.agency,
//       status: 'pending'
//     });

//     console.log('✅ Shift booked successfully:', booking._id);
//     res.status(201).json(booking);

//   } catch (err) {
//     console.error('❌ Error booking shift:', err.message);
//     next(err);
//   }
// };

// module.exports = { createShift, getShifts, bookShift };
