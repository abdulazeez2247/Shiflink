
const express = require('express');
const router = express.Router();
const { 
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
} = require('../controllers/agencyController');
const auth = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');

router.use(auth, roleCheck('agency'));

router.post('/shifts', createShift);
router.get('/shifts', getAgencyShifts);
router.get('/bookings', getAgencyBookings);
router.get('/stats', getAgencyStats);
router.put('/shifts/:id', updateShift);
router.delete('/shifts/:id', deleteShift);

// Add these new routes
router.get('/dsp-applications', getDSPApplications);
router.put('/dsp-applications/:id', updateDSPApplication);
router.get('/analytics/shifts', getShiftAnalytics);
router.get('/analytics/compliance', getComplianceReports);

module.exports = router;