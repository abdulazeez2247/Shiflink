// const User = require('../models/User');
// // const Facility = require('../models/Facility');
// // const ActivityLog = require('../models/ActivityLog');
// const createError = require('http-errors');

// const getCountyStats = async (req, res, next) => {
//   try {
//     const totalDSPs = await User.countDocuments({ role: 'dsp', county: req.user.county });
//     const activeDSPs = await User.countDocuments({ role: 'dsp', county: req.user.county, isActive: true });
//     const pendingApprovals = await User.countDocuments({ role: 'dsp', county: req.user.county, approvalStatus: 'pending' });
//     const flaggedDSPs = await User.countDocuments({ role: 'dsp', county: req.user.county, complianceStatus: { $ne: 'compliant' } });
    
//     const facilities = await Facility.find({ county: req.user.county });
//     const totalShifts = facilities.reduce((sum, facility) => sum + (facility.shiftCount || 0), 0);
//     const credentialIssues = await User.countDocuments({ 
//       role: 'dsp', 
//       county: req.user.county, 
//       'credentials.status': 'expired' 
//     });
    
//     const complianceRate = activeDSPs > 0 ? Math.round((activeDSPs - flaggedDSPs) / activeDSPs * 100) : 0;
    
//     res.json({
//       totalDSPs,
//       pendingApprovals,
//       activeDSPs,
//       flaggedDSPs,
//       upcomingJobFairs: 3,
//       totalShifts,
//       credentialIssues,
//       complianceRate,
//       activeDrivers: 45,
//       transportationRequests: 89
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// const getCountyFacilities = async (req, res, next) => {
//   try {
//     const facilities = await Facility.find({ county: req.user.county })
//       .select('name dsps location complianceStatus')
//       .populate('dsps', 'firstName lastName');
    
//     const formattedFacilities = facilities.map(facility => ({
//       name: facility.name,
//       dsps: facility.dsps.length,
//       location: facility.location,
//       status: facility.complianceStatus || 'Compliant'
//     }));
    
//     res.json(formattedFacilities);
//   } catch (err) {
//     next(err);
//   }
// };

// const getCountyRecentActivity = async (req, res, next) => {
//   try {
//     const activities = await ActivityLog.find({ county: req.user.county })
//       .sort({ createdAt: -1 })
//       .limit(10)
//       .populate('userId', 'firstName lastName');
    
//     const formattedActivities = activities.map(activity => ({
//       action: activity.action,
//       details: activity.details,
//       time: formatTimeAgo(activity.createdAt),
//       type: activity.type
//     }));
    
//     res.json(formattedActivities);
//   } catch (err) {
//     next(err);
//   }
// };

// const formatTimeAgo = (date) => {
//   const now = new Date();
//   const diffInSeconds = Math.floor((now - date) / 1000);
  
//   if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
//   if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
//   if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
//   return `${Math.floor(diffInSeconds / 86400)} days ago`;
// };

// module.exports = { 
//   // getCountyDSPs, 
//   // verifyDSPCompliance, 
//   getCountyStats, 
//   getCountyFacilities, 
//   getCountyRecentActivity 
// };
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const createError = require('http-errors');

const getCountyStats = async (req, res, next) => {
  try {
    console.log('Getting county stats for user:', req.user._id);
    
    // Since User model doesn't have county field, we'll work with all DSPs and Agencies
    const totalDSPs = await User.countDocuments({ role: 'dsp' });
    const activeDSPs = await User.countDocuments({ role: 'dsp', isActive: true });
    const pendingApprovals = await User.countDocuments({ role: 'dsp', applicationStatus: 'pending' });
    const flaggedDSPs = await User.countDocuments({ role: 'dsp', applicationStatus: 'flagged' });
    
    // Count DSPs with compliance issues
    const complianceIssues = await User.countDocuments({ 
      role: 'dsp',
      $or: [
        { 'complianceStatus.isComplete': false },
        { 'complianceStatus.expiryDate': { $lt: new Date() } },
        { 'complianceStatus.expiryDate': { $exists: false } }
      ]
    });
    
    const complianceRate = activeDSPs > 0 ? Math.round((activeDSPs - flaggedDSPs) / activeDSPs * 100) : 0;
    
    console.log('Stats calculated:', { totalDSPs, activeDSPs, pendingApprovals, flaggedDSPs, complianceIssues, complianceRate });
    
    res.json({
      totalDSPs,
      pendingApprovals,
      activeDSPs,
      flaggedDSPs,
      credentialIssues: complianceIssues, // Using complianceIssues as credentialIssues
      complianceRate
    });
  } catch (err) {
    console.error('Error in getCountyStats:', err);
    next(err);
  }
};

const getCountyFacilities = async (req, res, next) => {
  try {
    console.log('Getting agencies as facilities');
    
    // Get agencies as "facilities"
    const agencies = await User.find({ 
      role: 'agency'
    }).select('first_name last_name agencyName agencyAddress phone email isActive').limit(10);
    
    const formattedFacilities = agencies.map(agency => ({
      name: agency.agencyName || `${agency.first_name} ${agency.last_name}`,
      dsps: 0, // You can count DSPs per agency later if needed
      location: agency.agencyAddress ? 
        `${agency.agencyAddress.city || ''}, ${agency.agencyAddress.state || ''}`.trim() : 
        'Location not set',
      status: agency.isActive ? 'Active' : 'Inactive'
    }));
    
    console.log('Agencies found:', formattedFacilities.length);
    
    res.json(formattedFacilities);
  } catch (err) {
    console.error('Error in getCountyFacilities:', err);
    next(err);
  }
};

const getCountyRecentActivity = async (req, res, next) => {
  try {
    console.log('Getting recent activity');
    
    // Use AuditLog model for recent activity
    const activities = await AuditLog.find({})
      .sort({ timestamp: -1 })
      .limit(10)
      .populate('user', 'first_name last_name role');
    
    const formattedActivities = activities.map(activity => ({
      action: activity.action,
      details: activity.user ? 
        `${activity.user.first_name} ${activity.user.last_name} (${activity.user.role}) - ${activity.targetModel}` :
        `System - ${activity.targetModel}`,
      time: formatTimeAgo(activity.timestamp),
      type: getActivityType(activity.action)
    }));
    
    console.log('Activities found:', formattedActivities.length);
    
    res.json(formattedActivities);
  } catch (err) {
    console.error('Error in getCountyRecentActivity:', err);
    next(err);
  }
};

const getCountyDSPs = async (req, res, next) => {
  try {
    console.log('Getting all DSPs');
    
    const dsps = await User.find({ 
      role: 'dsp'
    }).select('first_name last_name email phone isActive applicationStatus complianceStatus experience skills certifications createdAt').limit(20);
    
    console.log('DSPs found:', dsps.length);
    
    res.json(dsps);
  } catch (err) {
    console.error('Error in getCountyDSPs:', err);
    next(err);
  }
};

const verifyDSPCompliance = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log('Verifying DSP compliance for:', id);
    
    const dsp = await User.findOne({ 
      _id: id, 
      role: 'dsp'
    });
    
    if (!dsp) {
      throw createError(404, 'DSP not found');
    }
    
    // Update compliance status using the existing User schema
    dsp.complianceStatus = dsp.complianceStatus || {};
    dsp.complianceStatus.isComplete = true;
    dsp.complianceStatus.expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year from now
    await dsp.save();
    
    // Log the activity in AuditLog
    await AuditLog.create({
      user: req.user._id,
      role: req.user.role,
      action: 'DSP Compliance Verified',
      targetModel: 'User',
      targetId: dsp._id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: { 
        verifiedBy: req.user._id,
        verificationDate: new Date(),
        dspName: `${dsp.first_name} ${dsp.last_name}`
      }
    });
    
    res.json({ 
      message: 'DSP compliance verified successfully', 
      dsp: {
        id: dsp._id,
        name: `${dsp.first_name} ${dsp.last_name}`,
        complianceStatus: dsp.complianceStatus
      }
    });
  } catch (err) {
    console.error('Error in verifyDSPCompliance:', err);
    next(err);
  }
};

// Helper function to format time ago
const formatTimeAgo = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
};

// Helper function to determine activity type based on action
const getActivityType = (action) => {
  if (action.includes('Verified') || action.includes('Approved')) return 'approval';
  if (action.includes('Expired') || action.includes('Failed')) return 'alert';
  return 'info';
};

module.exports = { 
  getCountyDSPs, 
  verifyDSPCompliance, 
  getCountyStats, 
  getCountyFacilities, 
  getCountyRecentActivity 
};