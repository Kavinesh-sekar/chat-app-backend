const express = require('express');
const {CreateGroup,ReceiveMessage,JoinGroup,SendGroupMessage}= require('../controllers/groupController');

const router = express.Router();
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage });
const { authedicate } = require('../middlewares/authMiddleware');

router.use(authedicate);


router.post('/create_group',CreateGroup);

router.post('/join_group',JoinGroup);


router.post('/send_message',upload.array('files'),SendGroupMessage);

router.get('/receieve/:groupId',ReceiveMessage);


module.exports = router;





