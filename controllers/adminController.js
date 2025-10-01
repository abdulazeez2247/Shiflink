// const mongoose = require("mongoose");
// const createError = require("http-errors");
// const User = require("../models/User");
// const AuditLog = require("../models/AuditLog");

// const getClientInfo = (req) => {
//   return {
//     ipAddress: req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress,
//     userAgent: req.headers["user-agent"],
//   };
// };

// // @desc Suspend a user
// const suspendUser = async (req, res, next) => {
//   try {
//     const { userId, reason } = req.body;

//     if (!userId || !reason) throw createError(400, "User ID and reason are required");

//     const user = await User.findByIdAndUpdate(
//       userId,
//       {
//         isSuspended: true,
//         suspensionReason: reason,
//         suspendedBy: req.user._id,
//       },
//       { new: true }
//     ).select("-password");

//     if (!user) throw createError(404, "User not found");

//     const { ipAddress, userAgent } = getClientInfo(req);

//     await AuditLog.create({
//       user: req.user._id,
//       role: "Admin",
//       action: `Suspended user ${userId}`,
//       targetModel: "User",
//       targetId: userId,
//       ipAddress,
//       userAgent,
//       metadata: { reason },
//     });

//     res.json({ message: "User suspended successfully", user });
//   } catch (err) {
//     next(err);
//   }
// };

// // @desc Reinstate a user
// const reinstateUser = async (req, res, next) => {
//   try {
//     const { userId } = req.body;

//     if (!userId) throw createError(400, "User ID is required");

//     const user = await User.findByIdAndUpdate(
//       userId,
//       {
//         isSuspended: false,
//         suspensionReason: null,
//         suspendedBy: null,
//       },
//       { new: true }
//     ).select("-password");

//     if (!user) throw createError(404, "User not found");

//     const { ipAddress, userAgent } = getClientInfo(req);

//     await AuditLog.create({
//       user: req.user._id,
//       role: "Admin",
//       action: `Reinstated user ${userId}`,
//       targetModel: "User",
//       targetId: userId,
//       ipAddress,
//       userAgent,
//     });

//     res.json({ message: "User reinstated successfully", user });
//   } catch (err) {
//     next(err);
//   }
// };

// // @desc Dashboard stats
// const getDashboardStats = async (req, res, next) => {
//   try {
//     const [users, shifts, bookings, payments] = await Promise.all([
//       User.countDocuments(),
//       mongoose.model("Shift").countDocuments(),
//       mongoose.model("Booking").countDocuments({ status: "pending" }),
//       mongoose.model("Payment").countDocuments({ status: "completed" }),
//     ]);

//     res.json({
//       totalUsers: users,
//       totalShifts: shifts,
//       pendingBookings: bookings,
//       completedPayments: payments,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// // @desc Get audit logs (with filters)
// const getAuditLogs = async (req, res, next) => {
//   try {
//     const { role, action, startDate, endDate, limit = 50 } = req.query;
//     const filter = {};

//     if (role) filter.role = role;
//     if (action) filter.action = new RegExp(action, "i");
//     if (startDate || endDate) {
//       filter.timestamp = {};
//       if (startDate) filter.timestamp.$gte = new Date(startDate);
//       if (endDate) filter.timestamp.$lte = new Date(endDate);
//     }

//     const logs = await AuditLog.find(filter)
//       .sort({ timestamp: -1 })
//       .limit(Number(limit))
//       .populate("user", "name email role");

//     res.json(logs);
//   } catch (err) {
//     next(err);
//   }
// };

// module.exports = {
//   suspendUser,
//   reinstateUser,
//   getDashboardStats,
//   getAuditLogs,
// };
const User = require('../models/User');
const Shift = require('../models/Shift');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const AuditLog = require('../models/AuditLog');
const createError = require('http-errors');

const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalShifts,
      pendingBookings,
      completedPayments,
      activeDSPs,
      activeTrainers
    ] = await Promise.all([
      User.countDocuments(),
      Shift.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      Payment.countDocuments({ status: 'completed' }),
      User.countDocuments({ role: 'dsp', isActive: true }),
      User.countDocuments({ role: 'trainer', isActive: true })
    ]);

    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalCommission = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$platformFee' } } }
    ]);

    res.json({
      totalUsers,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalCommission: totalCommission[0]?.total || 0,
      pendingPayouts: 1250.00,
      activeTrainers,
      activeDSPs,
      pendingApprovals: pendingBookings
    });
  } catch (err) {
    next(err);
  }
};

const getAuditLogs = async (req, res, next) => {
  try {
    const { role, action, startDate, endDate, limit = 50 } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (action) filter.action = new RegExp(action, 'i');
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const logs = await AuditLog.find(filter)
      .sort({ timestamp: -1 })
      .limit(Number(limit))
      .populate('user', 'name email role');

    res.json(logs);
  } catch (err) {
    next(err);
  }
};

const suspendUser = async (req, res, next) => {
  try {
    const { userId, reason } = req.body;
    if (!userId || !reason) throw createError(400, 'User ID and reason are required');

    const user = await User.findByIdAndUpdate(
      userId,
      {
        isSuspended: true,
        suspensionReason: reason,
        suspendedBy: req.user._id,
      },
      { new: true }
    ).select('-password');

    if (!user) throw createError(404, 'User not found');

    await AuditLog.create({
      user: req.user._id,
      role: 'Admin',
      action: `Suspended user ${userId}`,
      targetModel: 'User',
      targetId: userId,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: { reason },
    });

    res.json({ message: 'User suspended successfully', user });
  } catch (err) {
    next(err);
  }
};

const reinstateUser = async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) throw createError(400, 'User ID is required');

    const user = await User.findByIdAndUpdate(
      userId,
      {
        isSuspended: false,
        suspensionReason: null,
        suspendedBy: null,
      },
      { new: true }
    ).select('-password');

    if (!user) throw createError(404, 'User not found');

    await AuditLog.create({
      user: req.user._id,
      role: 'Admin',
      action: `Reinstated user ${userId}`,
      targetModel: 'User',
      targetId: userId,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.json({ message: 'User reinstated successfully', user });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAdminStats,
  getAuditLogs,
  suspendUser,
  reinstateUser
};