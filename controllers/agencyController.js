const Shift = require('../models/Shift');
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

const getAgencyShifts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const filter = { agency: req.user._id, isDeleted: false };
    if (status) filter.status = status;

    const shifts = await Shift.find(filter)
      .populate('assignedDSP', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json(shifts);
  } catch (err) {
    next(err);
  }
};

const getAgencyBookings = async (req, res, next) => {
  try {
    const shifts = await Shift.find({ agency: req.user._id }).select('_id');
    const bookings = await Booking.find({ shift: { $in: shifts } })
      .populate('dsp', 'firstName lastName email')
      .populate('shift', 'title startTime endTime');

    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

module.exports = { createShift, getAgencyShifts, getAgencyBookings };