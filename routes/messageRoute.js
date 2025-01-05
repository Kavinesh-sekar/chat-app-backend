const express = require('express');
const { sendMessage, getMessages } = require('../controllers/messageController');
const router = express.Router();
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Route to send a message with single or multiple files
router.post('/send',upload.array('files', 10), sendMessage);  // 'any' allows for single or multiple files

// Route to get messages between two users
router.get('/:senderId/:receiverId', getMessages);

module.exports = router;
