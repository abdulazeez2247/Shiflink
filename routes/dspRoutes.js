// const express = require('express');
// const router = express.Router();
// const { getAvailableShifts, getDSPBookings, updateAvailability } = require('../controllers/dspController');
// const auth = require('../middlewares/auth');
// const roleCheck = require('../middlewares/roleCheck');

// router.use(auth, roleCheck('dsp'));
// router.get('/available-shifts', getAvailableShifts);
// router.get('/my-bookings', getDSPBookings);
// router.put('/availability', updateAvailability);

// module.exports = router;
const express = require('express');
const router = express.Router();
const { 
  getAvailableShifts, 
  getDSPBookings, 
  updateAvailability, 
  bookShift,  // Add this
  cancelBooking  // Add this
} = require('../controllers/dspController');
const auth = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');

router.use(auth, roleCheck('dsp'));
router.get('/available-shifts', getAvailableShifts);
router.get('/my-bookings', getDSPBookings);
router.put('/availability', updateAvailability);
router.post('/book-shift', bookShift);  // Add this line
router.delete('/cancel-booking/:bookingId', cancelBooking);  // Add this line

module.exports = router;