const express = require('express');
const router = express.Router();
const { getCountyDSPs, verifyDSPCompliance } = require('../controllers/countyController');
const auth = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');

router.use(auth, roleCheck('county'));
router.get('/dsps', getCountyDSPs);
router.post('/verify-dsp/:id', verifyDSPCompliance);

module.exports = router;