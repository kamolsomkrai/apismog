const db = require('../config/db');
const crypto = require('crypto');

const apiLogger = (req, res, next) => {
    // Generate Request ID
    const requestId = crypto.randomBytes(16).toString('hex');
    req.requestId = requestId;
    const startTime = Date.now();

    // Hook into response finish
    res.on('finish', async () => {
        const duration = Date.now() - startTime;
        
        try {
            // Context
            const hospCode = req.user?.hospcode || null;
            const apiKeyId = req.user?.apiKeyId || null;
            const endpoint = req.originalUrl || req.url;
            const method = req.method;
            const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            const userAgent = req.headers['user-agent'] || '';
            
            // Outcome
            const statusCode = res.statusCode;
            const success = statusCode >= 200 && statusCode < 300;
            
            // Details (Set by controller/middleware)
            const errorMessage = res.locals.errorMessage || null;
            const errorDetail = res.locals.errorDetail || null;
            const recordsReceived = res.locals.recordCount || 0;

            await db.query(
                `INSERT INTO api_logs 
                (request_id, hosp_code, api_key_id, endpoint, method, status_code, success, error_message, error_detail, ip_address, user_agent, duration_ms, records_received)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    requestId, 
                    hospCode, 
                    apiKeyId, 
                    endpoint, 
                    method, 
                    statusCode, 
                    success, 
                    errorMessage, 
                    errorDetail, 
                    ip, 
                    userAgent, 
                    duration, 
                    recordsReceived
                ]
            );

        } catch (err) {
            console.error("Logger Error:", err);
        }
    });

    next();
};

module.exports = apiLogger;
