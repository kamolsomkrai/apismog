// routes/authRoutes.js
const express = require('express');

const { register, login, getToken, logout, refreshToken, getUser } = require('../controllers/authController');
const { authenticateTokenFromCookies } = require('../middlewares/authenticateToken');

const router = express.Router();

// Route สำหรับ register
router.post('/register', register);

// Route สำหรับ login
router.post('/login', login);

// เส้นทางสำหรับการรับ Token (ส่ง Token ใน response body)
router.post('/gettoken', getToken);

// Route สำหรับ logout
router.post('/logout', authenticateTokenFromCookies, logout);

// Route สำหรับ get user info
router.get('/user', authenticateTokenFromCookies, getUser);

module.exports = router;
