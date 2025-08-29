const express = require('express');
const router = express.Router();
const { createShift, getShifts, bookShift } = require('../controllers/shiftController');
const auth = require('../middlewares/auth');

router.use(auth);
router.post('/', createShift);
router.get('/', getShifts);
router.post('/:shiftId/book', bookShift);

module.exports = router;