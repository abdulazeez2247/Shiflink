const express = require('express');
const { createAdmin, adminLogin } = require('../controllers/adminController');
const router = express.Router();

// Restricted to super-admins only
router.post('/invite', createAdmin); 

// Admin-specific login
router.post('/login', adminLogin);

module.exports = router;