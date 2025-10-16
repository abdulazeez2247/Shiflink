// const express = require('express');
// const router = express.Router();
// const { 
//   // getCountyDSPs, 
//   // verifyDSPCompliance, 
//   getCountyStats, 
//   getCountyFacilities, 
//   getCountyRecentActivity 
// } = require('../controllers/countyController');
// const auth = require('../middlewares/auth');
// const roleCheck = require('../middlewares/roleCheck');

// router.use(auth, roleCheck('county'));
// // router.get('/dsps', getCountyDSPs);
// // router.post('/verify-dsp/:id', verifyDSPCompliance);
// router.get('/stats', getCountyStats);
// router.get('/facilities', getCountyFacilities);
// router.get('/recent-activity', getCountyRecentActivity);

// module.exports = router;
const express = require('express');
const router = express.Router();
const { 
  getCountyDSPs, 
  verifyDSPCompliance, 
  getCountyStats, 
  getCountyFacilities, 
  getCountyRecentActivity 
} = require('../controllers/countyController');
const auth = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');

router.use(auth, roleCheck('county'));
router.get('/dsps', getCountyDSPs);
router.post('/verify-dsp/:id', verifyDSPCompliance);
router.get('/stats', getCountyStats);
router.get('/facilities', getCountyFacilities);
router.get('/recent-activity', getCountyRecentActivity);

module.exports = router;