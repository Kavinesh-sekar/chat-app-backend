const express = require('express');
const {CreateGroup,ReceiveMessage,JoinGroup,SendMessage}= require('../controllers/groupController');

const router = express.Router();


router.post('/create_group',CreateGroup);

router.post('/join_group',JoinGroup);


router.post('/send_message',SendMessage);

router.get('/gg/:group-id',ReceiveMessage);


module.exports = router;





