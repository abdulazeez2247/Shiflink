const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, deleteNotification } = require('../controllers/notificationController');
const auth = require('../middlewares/auth');

router.use(auth);
router.get('/', getNotifications);
router.patch('/mark-read', markAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;