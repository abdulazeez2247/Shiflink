const express = require('express');
const router = express.Router();
const { register, login, forgotPassword } = require('../controllers/authController');
const auth = require('../middlewares/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.get('/me', auth, (req, res) => res.json(req.user));

module.exports = router;