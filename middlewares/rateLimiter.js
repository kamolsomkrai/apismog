// middlewares/rateLimiter.js
const rateLimit = require('express-rate-limit');

const externalApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 นาที
    max: 100, // จำกัดที่ 100 คำขอในช่วงเวลา
    standardHeaders: true, // ส่ง rate limit info ใน `RateLimit-*` headers
    legacyHeaders: false, // ปิดการใช้งาน `X-RateLimit-*` headers
    message: 'Too many requests from this IP, please try again later.'
});

const generalApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 นาที
    max: 1000, // จำกัดที่ 1000 คำขอในช่วงเวลา
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again later.'
});

module.exports = {
    externalApiLimiter,
    generalApiLimiter
};
