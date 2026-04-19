const express = require('express');
const { handleSmogImportV2 } = require('../controllers/smogImportControllerV2');
const authenticateApiKey = require('../middlewares/authenticateApiKey');
const { externalApiLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

// POST /api/smog_import_v2
router.post(
    '/', 
    authenticateApiKey, 
    externalApiLimiter, 
    handleSmogImportV2
);

module.exports = router;
