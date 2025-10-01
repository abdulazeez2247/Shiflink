const User = require('../models/User');
// const Facility = require('../models/Facility');
// const ActivityLog = require('../models/ActivityLog');
const createError = require('http-errors');

const getCountyStats = async (req, res, next) => {
  try {
    const totalDSPs = await User.countDocuments({ role: 'dsp', county: req.user.county });
    const activeDSPs = await User.countDocuments({ role: 'dsp', county: req.user.county, isActive: true });
    const pendingApprovals = await User.countDocuments({ role: 'dsp', county: req.user.county, approvalStatus: 'pending' });
    const flaggedDSPs = await User.countDocuments({ role: 'dsp', county: req.user.county, complianceStatus: { $ne: 'compliant' } });
    
    const facilities = await Facility.find({ county: req.user.county });
    const totalShifts = facilities.reduce((sum, facility) => sum + (facility.shiftCount || 0), 0);
    const credentialIssues = await User.countDocuments({ 
      role: 'dsp', 
      county: req.user.county, 
      'credentials.status': 'expired' 
    });
    
    const complianceRate = activeDSPs > 0 ? Math.round((activeDSPs - flaggedDSPs) / activeDSPs * 100) : 0;
    
    res.json({
      totalDSPs,
      pendingApprovals,
      activeDSPs,
      flaggedDSPs,
      upcomingJobFairs: 3,
      totalShifts,
      credentialIssues,
      complianceRate,
      activeDrivers: 45,
      transportationRequests: 89
    });
  } catch (err) {
    next(err);
  }
};

const getCountyFacilities = async (req, res, next) => {
  try {
    const facilities = await Facility.find({ county: req.user.county })
      .select('name dsps location complianceStatus')
      .populate('dsps', 'firstName lastName');
    
    const formattedFacilities = facilities.map(facility => ({
      name: facility.name,
      dsps: facility.dsps.length,
      location: facility.location,
      status: facility.complianceStatus || 'Compliant'
    }));
    
    res.json(formattedFacilities);
  } catch (err) {
    next(err);
  }
};

const getCountyRecentActivity = async (req, res, next) => {
  try {
    const activities = await ActivityLog.find({ county: req.user.county })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'firstName lastName');
    
    const formattedActivities = activities.map(activity => ({
      action: activity.action,
      details: activity.details,
      time: formatTimeAgo(activity.createdAt),
      type: activity.type
    }));
    
    res.json(formattedActivities);
  } catch (err) {
    next(err);
  }
};

const formatTimeAgo = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
};

module.exports = { 
  // getCountyDSPs, 
  // verifyDSPCompliance, 
  getCountyStats, 
  getCountyFacilities, 
  getCountyRecentActivity 
};