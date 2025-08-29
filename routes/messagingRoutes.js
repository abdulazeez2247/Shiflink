const express = require('express');
const router = express.Router();
const { getConversations, sendMessage, startConversation } = require('../controllers/messagingController');
const auth = require('../middlewares/auth');

router.use(auth);
router.get('/conversations', getConversations);
router.post('/send-message', sendMessage);
router.post('/start-conversation', startConversation);

module.exports = router;