const express = require('express');
const { sendMessage, getMessages } = require('../controllers/messageController');

const router = express.Router();

router.post('/send', sendMessage);
router.get('/:senderId/:receiverId', getMessages);

module.exports = router;
