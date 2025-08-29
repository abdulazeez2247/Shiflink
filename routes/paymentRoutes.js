const express = require('express');
const router = express.Router();
const { createPayment, getUserPayments, handleRefund } = require('../controllers/paymentController');
const auth = require('../middlewares/auth');

router.use(auth);

router.post('/create', createPayment);
router.get('/my-payments', getUserPayments);
router.post('/refund', handleRefund);

module.exports = router;
