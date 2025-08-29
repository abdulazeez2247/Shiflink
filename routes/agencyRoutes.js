const express = require('express');
const router = express.Router();
const { createShift, getAgencyShifts, getAgencyBookings } = require('../controllers/agencyController');
const auth = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');

router.use(auth, roleCheck('agency'));
router.post('/shifts', createShift);
router.get('/shifts', getAgencyShifts);
router.get('/bookings', getAgencyBookings);

module.exports = router;