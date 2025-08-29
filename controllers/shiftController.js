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

const getShifts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const filter = { isDeleted: false };
    if (status) filter.status = status;

    const shifts = await Shift.find(filter)
      .populate('agency', 'firstName lastName email')
      .populate('assignedDSP', 'firstName lastName')
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
    const shift = await Shift.findById(shiftId);
    
    if (!shift || shift.status !== 'open') {
      throw createError(400, 'Shift not available for booking');
    }

    const booking = await Booking.create({
      shift: shiftId,
      dsp: req.user._id,
      agency: shift.agency,
      status: 'pending'
    });

    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
};

module.exports = { createShift, getShifts, bookShift };