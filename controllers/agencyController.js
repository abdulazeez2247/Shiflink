// const Shift = require('../models/Shift');
// const Booking = require('../models/Booking');
// const createError = require('http-errors');

// const createShift = async (req, res, next) => {
//   try {
//     const shift = await Shift.create({ ...req.body, agency: req.user._id });
//     res.status(201).json(shift);
//   } catch (err) {
//     next(createError(400, err.message));
//   }
// };

// const getAgencyShifts = async (req, res, next) => {
//   try {
//     const { page = 1, limit = 10, status } = req.query;
//     const filter = { agency: req.user._id, isDeleted: false };
//     if (status) filter.status = status;

//     const shifts = await Shift.find(filter)
//       .populate('assignedDSP', 'firstName lastName')
//       .sort({ createdAt: -1 })
//       .limit(limit * 1)
//       .skip((page - 1) * limit);

//     res.json(shifts);
//   } catch (err) {
//     next(err);
//   }
// };

// const getAgencyBookings = async (req, res, next) => {
//   try {
//     const shifts = await Shift.find({ agency: req.user._id }).select('_id');
//     const bookings = await Booking.find({ shift: { $in: shifts } })
//       .populate('dsp', 'firstName lastName email')
//       .populate('shift', 'title startTime endTime');

//     res.json(bookings);
//   } catch (err) {
//     next(err);
//   }
// };

// module.exports = { createShift, getAgencyShifts, getAgencyBookings };
// const Shift = require('../models/Shift');
// const Booking = require('../models/Booking');
// const User = require('../models/User');
// const createError = require('http-errors');

// const createShift = async (req, res, next) => {
//   try {
//     const shift = await Shift.create({ ...req.body, agency: req.user._id });
//     res.status(201).json(shift);
//   } catch (err) {
//     next(createError(400, err.message));
//   }
// };

// const getAgencyShifts = async (req, res, next) => {
//   try {
//     const { page = 1, limit = 10, status } = req.query;
//     const filter = { agency: req.user._id, isDeleted: false };
//     if (status) filter.status = status;

//     const shifts = await Shift.find(filter)
//       .populate('assignedDSP', 'firstName lastName')
//       .sort({ createdAt: -1 })
//       .limit(limit * 1)
//       .skip((page - 1) * limit);

//     res.json(shifts);
//   } catch (err) {
//     next(err);
//   }
// };

// const getAgencyBookings = async (req, res, next) => {
//   try {
//     const shifts = await Shift.find({ agency: req.user._id }).select('_id');
//     const bookings = await Booking.find({ shift: { $in: shifts } })
//       .populate('dsp', 'firstName lastName email')
//       .populate('shift', 'title startTime endTime');

//     res.json(bookings);
//   } catch (err) {
//     next(err);
//   }
// };

// const updateShift = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const shift = await Shift.findOneAndUpdate(
//       { _id: id, agency: req.user._id },
//       req.body,
//       { new: true, runValidators: true }
//     ).populate('assignedDSP', 'firstName lastName');

//     if (!shift) {
//       return next(createError(404, 'Shift not found'));
//     }

//     res.json(shift);
//   } catch (err) {
//     next(createError(400, err.message));
//   }
// };

// const deleteShift = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const shift = await Shift.findOneAndUpdate(
//       { _id: id, agency: req.user._id },
//       { isDeleted: true },
//       { new: true }
//     );

//     if (!shift) {
//       return next(createError(404, 'Shift not found'));
//     }

//     res.json({ message: 'Shift deleted successfully' });
//   } catch (err) {
//     next(err);
//   }
// };

// const getAgencyStats = async (req, res, next) => {
//   try {
//     const agencyId = req.user._id;
    
//     // Get total active shifts
//     const totalShifts = await Shift.countDocuments({
//       agency: agencyId,
//       isDeleted: false,
//       status: 'active'
//     });
    
//     // Get active DSPs (DSPs who have booked shifts with this agency)
//     const activeDSPs = await Booking.distinct('dsp', {
//       'shift.agency': agencyId,
//       status: { $in: ['confirmed', 'completed'] }
//     });
    
//     // Get pending applications (bookings with pending status)
//     const pendingApplications = await Booking.countDocuments({
//       'shift.agency': agencyId,
//       status: 'pending'
//     });
    
//     // Get this month's hours (completed shifts)
//     const startOfMonth = new Date();
//     startOfMonth.setDate(1);
//     startOfMonth.setHours(0, 0, 0, 0);
    
//     const completedBookings = await Booking.find({
//       'shift.agency': agencyId,
//       status: 'completed',
//       createdAt: { $gte: startOfMonth }
//     }).populate('shift');
    
//     const thisMonthHours = completedBookings.reduce((total, booking) => {
//       const shift = booking.shift;
//       const hours = (new Date(shift.endTime) - new Date(shift.startTime)) / (1000 * 60 * 60);
//       return total + hours;
//     }, 0);
    
//     res.json({
//       totalShifts,
//       activeDSPs: activeDSPs.length,
//       pendingApplications,
//       thisMonthHours: Math.round(thisMonthHours)
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// module.exports = { 
//   createShift, 
//   getAgencyShifts, 
//   getAgencyBookings, 
//   updateShift, 
//   deleteShift, 
//   getAgencyStats 
// };
const Shift = require('../models/Shift');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Credential = require('../models/Credential');
const createError = require('http-errors');

// Existing shift methods
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
      .populate('assignedDSP', 'first_name last_name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get applications count for each shift
    const shiftsWithApplications = await Promise.all(
      shifts.map(async (shift) => {
        const applicationsCount = await Booking.countDocuments({
          shift: shift._id,
          status: 'pending',
          isDeleted: false
        });
        
        return {
          ...shift.toObject(),
          applicationsCount
        };
      })
    );

    const total = await Shift.countDocuments(filter);

    res.json({
      shifts: shiftsWithApplications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    next(err);
  }
};

const getAgencyBookings = async (req, res, next) => {
  try {
    const shifts = await Shift.find({ agency: req.user._id }).select('_id');
    const bookings = await Booking.find({ shift: { $in: shifts } })
      .populate('dsp', 'first_name last_name email') // FIXED: Use underscores
      .populate('shift', 'title startTime endTime');

    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

const updateShift = async (req, res, next) => {
  try {
    const { id } = req.params;
    const shift = await Shift.findOneAndUpdate(
      { _id: id, agency: req.user._id },
      req.body,
      { new: true, runValidators: true }
    ).populate('assignedDSP', 'first_name last_name email'); // FIXED: Use underscores

    if (!shift) {
      return next(createError(404, 'Shift not found'));
    }

    res.json(shift);
  } catch (err) {
    next(createError(400, err.message));
  }
};

const deleteShift = async (req, res, next) => {
  try {
    const { id } = req.params;
    const shift = await Shift.findOneAndUpdate(
      { _id: id, agency: req.user._id },
      { isDeleted: true },
      { new: true }
    );

    if (!shift) {
      return next(createError(404, 'Shift not found'));
    }

    res.json({ message: 'Shift deleted successfully' });
  } catch (err) {
    next(err);
  }
};

const getAgencyStats = async (req, res, next) => {
  try {
    const agencyId = req.user._id;
    
    // FIXED: Count ALL active shifts (including 'open' status)
    const totalShifts = await Shift.countDocuments({
      agency: agencyId,
      isDeleted: false,
      status: { $in: ['open', 'assigned', 'active'] }
    });
    
    // FIXED: Get active DSPs from BOOKINGS (not just shifts)
    const activeBookings = await Booking.find({
      agency: agencyId,
      status: { $in: ['confirmed', 'assigned', 'active'] },
      isDeleted: false
    }).select('dsp');
    
    // Get unique DSP IDs from bookings
    const activeDSPIds = [...new Set(activeBookings.map(booking => booking.dsp?.toString()).filter(Boolean))];
    
    // FIXED: Get pending applications
    const pendingApplications = await Booking.countDocuments({
      agency: agencyId,
      status: 'pending',
      isDeleted: false
    });
    
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const completedBookings = await Booking.find({
      agency: agencyId,
      status: 'completed',
      createdAt: { $gte: startOfMonth },
      isDeleted: false
    }).populate('shift');
    
    const thisMonthHours = completedBookings.reduce((total, booking) => {
      const shift = booking.shift;
      if (shift) {
        const hours = (new Date(shift.endTime) - new Date(shift.startTime)) / (1000 * 60 * 60);
        return total + hours;
      }
      return total;
    }, 0);
    
    res.json({
      totalShifts,
      activeDSPs: activeDSPIds.length,
      pendingApplications,
      thisMonthHours: Math.round(thisMonthHours)
    });
  } catch (err) {
    next(err);
  }
};

// DSP Management Methods
const getDSPApplications = async (req, res, next) => {
  try {
    const { status } = req.query;
    const agencyId = req.user._id;
    
    // FIXED: Get DSP applications from bookings (not from user appliedAgencies)
    let filter = { 
      agency: agencyId,
      isDeleted: false
    };
    
    if (status && status !== 'all') {
      filter.status = status;
    }

    const applications = await Booking.find(filter)
      .populate('dsp', 'first_name last_name email phone experience skills certifications')
      .populate('shift', 'title startTime endTime rate location')
      .sort({ createdAt: -1 });

    // Format the response to match frontend expectations
    const formattedApplications = applications.map(booking => ({
      _id: booking._id,
      bookingId: booking._id,  // Add booking ID
      shiftId: booking.shift?._id,
      firstName: booking.dsp?.first_name,
      lastName: booking.dsp?.last_name,
      email: booking.dsp?.email,
      phone: booking.dsp?.phone,
      experience: booking.dsp?.experience || 'Not specified',
      skills: booking.dsp?.skills || [],
      certifications: booking.dsp?.certifications || [],
      applicationStatus: booking.status || 'pending',
      applicationDate: booking.createdAt,
      createdAt: booking.createdAt,
      // Add shift information
      shiftTitle: booking.shift?.title,
      shiftDate: booking.shift?.startTime,
      shiftLocation: booking.shift?.location,
      shiftRate: booking.shift?.rate
    }));

    res.json(formattedApplications);
  } catch (err) {
    next(err);
  }
};

const updateDSPApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const agencyId = req.user._id;

    const booking = await Booking.findOne({
      _id: id,
      agency: agencyId,
      isDeleted: false
    }).populate('dsp').populate('shift');

    if (!booking) {
      return next(createError(404, 'Booking application not found'));
    }

    // Update booking status
    booking.status = status;
    
    if (notes) {
      booking.notes = booking.notes || [];
      booking.notes.push({
        note: notes,
        date: new Date(),
        addedBy: agencyId
      });
    }

    // If confirmed, update the shift's assigned DSP AND create conversation
    if (status === 'confirmed' && booking.shift) {
      await Shift.findByIdAndUpdate(booking.shift._id, {
        assignedDSP: booking.dsp._id,
        status: 'assigned'
      });

      // ✅ AUTO-CREATE CONVERSATION WHEN DSP IS ASSIGNED
      try {
        const conversation = await Conversation.findOne({
          shift: booking.shift._id,
          participants: { $all: [agencyId, booking.dsp._id] }
        });

        if (!conversation) {
          await Conversation.create({
            participants: [agencyId, booking.dsp._id],
            shift: booking.shift._id
          });
          console.log('✅ Auto-created conversation for shift:', booking.shift._id);
        }
      } catch (convError) {
        console.error('❌ Error auto-creating conversation:', convError.message);
        // Don't fail the whole request if conversation creation fails
      }
    }

    // If cancelled, remove assigned DSP from shift
    if (status === 'cancelled' && booking.shift) {
      await Shift.findByIdAndUpdate(booking.shift._id, {
        $unset: { assignedDSP: 1 },
        status: 'open'
      });
    }

    await booking.save();

    res.json({ 
      message: 'Application updated successfully',
      application: {
        _id: booking._id,
        status: booking.status,
        dspName: booking.dsp ? `${booking.dsp.first_name} ${booking.dsp.last_name}` : 'Unknown DSP',
        shiftTitle: booking.shift?.title
      }
    });
  } catch (err) {
    next(createError(400, err.message));
  }
};

// Analytics Methods
const getShiftAnalytics = async (req, res, next) => {
  try {
    const agencyId = req.user._id;
    const { timeframe = 'month' } = req.query;

    let startDate = new Date();
    switch (timeframe) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 1);
    }

    // Shift statistics
    const totalShifts = await Shift.countDocuments({
      agency: agencyId,
      isDeleted: false,
      createdAt: { $gte: startDate }
    });

    const completedShifts = await Shift.countDocuments({
      agency: agencyId,
      isDeleted: false,
      status: 'completed',
      createdAt: { $gte: startDate }
    });

    const activeShifts = await Shift.countDocuments({
      agency: agencyId,
      isDeleted: false,
      status: 'active',
      createdAt: { $gte: startDate }
    });

    // Booking statistics
    const totalBookings = await Booking.countDocuments({
      'shift.agency': agencyId,
      createdAt: { $gte: startDate }
    });

    const confirmedBookings = await Booking.countDocuments({
      'shift.agency': agencyId,
      status: 'confirmed',
      createdAt: { $gte: startDate }
    });

    // Revenue calculation (assuming hourly rate from shift model)
    const completedBookingsWithShifts = await Booking.find({
      'shift.agency': agencyId,
      status: 'completed',
      createdAt: { $gte: startDate }
    }).populate('shift');

    const totalRevenue = completedBookingsWithShifts.reduce((total, booking) => {
      const shift = booking.shift;
      const hours = (new Date(shift.endTime) - new Date(shift.startTime)) / (1000 * 60 * 60);
      return total + (hours * (shift.rate || 25)); // Use shift.rate or default $25/hour
    }, 0);

    // DSP performance - get top DSPs by completed shifts
    const topDSPs = await Booking.aggregate([
      {
        $match: {
          'shift.agency': agencyId,
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $lookup: {
          from: 'shifts',
          localField: 'shift',
          foreignField: '_id',
          as: 'shiftData'
        }
      },
      {
        $unwind: '$shiftData'
      },
      {
        $group: {
          _id: '$dsp',
          totalShifts: { $sum: 1 },
          totalHours: { 
            $sum: { 
              $divide: [
                { $subtract: ['$shiftData.endTime', '$shiftData.startTime'] }, 
                1000 * 60 * 60
              ] 
            } 
          }
        }
      },
      { $sort: { totalShifts: -1 } },
      { $limit: 5 }
    ]);

    // Populate DSP names for the top performers
    const topDSPsWithNames = await Promise.all(
      topDSPs.map(async (dsp) => {
        const dspUser = await User.findById(dsp._id).select('first_name last_name');
        return {
          _id: dsp._id,
          name: dspUser ? `${dspUser.first_name} ${dspUser.last_name}` : 'Unknown DSP',
          totalShifts: dsp.totalShifts,
          totalHours: dsp.totalHours
        };
      })
    );

    res.json({
      timeframe,
      shiftStats: {
        total: totalShifts,
        completed: completedShifts,
        active: activeShifts,
        completionRate: totalShifts > 0 ? (completedShifts / totalShifts) * 100 : 0
      },
      bookingStats: {
        total: totalBookings,
        confirmed: confirmedBookings,
        confirmationRate: totalBookings > 0 ? (confirmedBookings / totalBookings) * 100 : 0
      },
      financials: {
        totalRevenue: Math.round(totalRevenue),
        averageRevenuePerShift: completedShifts > 0 ? totalRevenue / completedShifts : 0
      },
      topDSPs: topDSPsWithNames
    });
  } catch (err) {
    next(err);
  }
};

const getComplianceReports = async (req, res, next) => {
  try {
    const agencyId = req.user._id;

    // Total shifts for this agency
    const totalShifts = await Shift.countDocuments({
      agency: agencyId,
      isDeleted: false
    });

    // Shifts with compliance issues (you might want to add a complianceIssues field to your Shift model)
    const shiftsWithIssues = await Shift.countDocuments({
      agency: agencyId,
      isDeleted: false,
      $or: [
        { complianceNotes: { $exists: true, $ne: [] } },
        { status: 'cancelled' },
        { 'compliance.issues': { $exists: true, $ne: [] } }
      ]
    });

    // Completed shifts
    const completedShifts = await Shift.countDocuments({
      agency: agencyId,
      isDeleted: false,
      status: 'completed'
    });

    // On-time shifts (assuming you have a field to track this)
    const onTimeShifts = await Shift.countDocuments({
      agency: agencyId,
      isDeleted: false,
      status: 'completed',
      $or: [
        { 'compliance.onTime': true },
        { 'compliance.rating': { $gte: 4 } } // Assuming rating 4+ is good
      ]
    });

    // Certified DSPs working with this agency
    const certifiedDSPs = await User.countDocuments({
      role: 'dsp',
      approvedAgencies: agencyId,
      $or: [
        { 'complianceStatus.isComplete': true },
        { certifications: { $exists: true, $ne: [] } }
      ]
    });

    // Total DSPs working with this agency
    const totalDSPs = await User.countDocuments({
      role: 'dsp',
      approvedAgencies: agencyId
    });

    const complianceRate = totalShifts > 0 ? ((totalShifts - shiftsWithIssues) / totalShifts) * 100 : 100;
    const onTimePerformance = completedShifts > 0 ? (onTimeShifts / completedShifts) * 100 : 100;
    const certifiedDSPPercentage = totalDSPs > 0 ? (certifiedDSPs / totalDSPs) * 100 : 0;

    res.json({
      complianceRate,
      onTimePerformance,
      certifiedDSPPercentage,
      shiftsWithIssues,
      totalShifts,
      certifiedDSPs,
      totalDSPs,
      completedShifts,
      onTimeShifts
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { 
  createShift, 
  getAgencyShifts, 
  getAgencyBookings, 
  updateShift, 
  deleteShift, 
  getAgencyStats,
  getDSPApplications,
  updateDSPApplication,
  getShiftAnalytics,
  getComplianceReports
};