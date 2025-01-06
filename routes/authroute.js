const express = require('express');
const { register, login ,getUserDashboard,RefreshTokenAccess} = require('../controllers/authController');
const { authedicate } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/user-dashBoard/:userId',authedicate, getUserDashboard);
router.post('/refresh-token', RefreshTokenAccess);


module.exports = router;