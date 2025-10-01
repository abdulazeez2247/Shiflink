// messagingRoutes.js - UPDATE TO MATCH FRONTEND
const express = require('express');
const router = express.Router();
const { 
  getConversations, 
  sendMessage, 
  startConversation,
  startShiftConversation,
  getShiftConversations,
  markMessagesAsRead,
  getActiveDSPsForAgency
} = require('../controllers/messagingController');
const auth = require('../middlewares/auth');

router.use(auth);

// Match frontend expectations exactly:
router.get('/conversations', getConversations); // GET /api/messaging/conversations
router.post('/send-message', sendMessage); // POST /api/messaging/send-message
router.post('/start-conversation', startConversation); // POST /api/messaging/start-conversation
router.post('/mark-read', markMessagesAsRead); // POST /api/messaging/mark-read
router.get('/active-dsps', getActiveDSPsForAgency);

// Add the new shift-specific routes
router.post('/shift-conversation', startShiftConversation); // POST /api/messaging/shift-conversation
router.get('/shift/:shiftId', getShiftConversations); // GET /api/messaging/shift/:shiftId

module.exports = router;