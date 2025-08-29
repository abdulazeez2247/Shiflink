const User = require('../models/User');
const Booking = require('../models/Booking');
const createError = require('http-errors');

const getAvailableShifts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const shifts = await Shift.find({ 
      status: 'open', 
      requirements: { $in: req.user.skills },
      startTime: { $gt: new Date() }
    })
    .populate('agency', 'firstName lastName')
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
    const bookings = await Booking.find({ dsp: req.user._id })
      .populate('shift', 'title location startTime endTime rate')
      .populate('agency', 'firstName lastName email');

    res.json(bookings);
  } catch (err) {
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

module.exports = { getAvailableShifts, getDSPBookings, updateAvailability };