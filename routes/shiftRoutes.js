
const express = require('express');
const router = express.Router();
const { 
  createShift, 
  getShifts, 
  bookShift, 
//   getShiftComplianceStatus  
} = require('../controllers/shiftController');
const auth = require('../middlewares/auth');

// router.use(auth);
router.post('/', createShift);
router.get('/', getShifts);
// router.get('/compliance-status', getShiftComplianceStatus); 
router.post('/:shiftId/book',auth,  bookShift);

module.exports = router;