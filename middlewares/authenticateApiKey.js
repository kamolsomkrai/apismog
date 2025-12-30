const crypto = require('crypto');
const db = require('../config/db');

const authenticateApiKey = async (req, res, next) => {
    const apiKeyHeader = req.headers['x-api-key'];

    if (!apiKeyHeader) {
        res.locals.errorMessage = "Missing x-api-key header";
        return res.status(401).json({ message: "API Key required (header: x-api-key)" });
    }

    // Format check (smog_...)
    if (!apiKeyHeader.startsWith('smog_')) {
        res.locals.errorMessage = "Invalid API Key format";
        return res.status(401).json({ message: "Invalid API Key format" });
    }

    try {
        // Hash the key
        const keyHash = crypto.createHash('sha256').update(apiKeyHeader).digest('hex');

        // Check DB
        const [rows] = await db.query(
            "SELECT id, user_id, hosp_code, name, is_active FROM api_keys WHERE key_hash = ?", 
            [keyHash]
        );

        if (rows.length === 0) {
            res.locals.errorMessage = "Invalid API Key";
            return res.status(403).json({ message: "Invalid API Key" });
        }

        const key = rows[0];

        if (!key.is_active) {
            res.locals.errorMessage = "API Key revoked";
            return res.status(403).json({ message: "API Key revoked" });
        }

        // Attach user info to request
        req.user = {
            id: key.user_id,
            hospcode: key.hosp_code, // Controller expects 'hospcode' (no underscore)
            apiKeyId: key.id,
            keyName: key.name
        };

        // Update Last Used (Async, don't await blocking)
        db.query("UPDATE api_keys SET last_used_at = NOW() WHERE id = ?", [key.id]).catch(console.error);

        next();

    } catch (err) {
        console.error("Auth Error:", err);
        res.locals.errorMessage = "Internal Authentication Error";
        res.locals.errorDetail = err.toString();
        return res.status(500).json({ message: "Internal Authentication Error" });
    }
};

module.exports = authenticateApiKey;
