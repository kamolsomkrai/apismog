// controllers/smogImportControllerV2.js
const zlib = require("zlib");
const crypto = require("crypto");
const { v4: uuidv4 } = require('uuid');
const {
  insertSmogImport,
  insertApiImport,
} = require("../models/smogImportModel");
const { insertApiLog } = require("../models/apiLogsModel");
const smogImportSchema = require("../validation/smogImportValidation");
const cleanDiagcode = require("../helpers/cleanDiagcode");
const db = require("../config/db");
require("dotenv").config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY.trim();
const ENCRYPTION_IV = process.env.ENCRYPTION_IV.trim();

function decryptData(encryptedData) {
  const encryptedBuffer = Buffer.from(encryptedData, "base64");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY, "utf8"),
    Buffer.from(ENCRYPTION_IV, "utf8")
  );
  return Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
}

const handleSmogImportV2 = async (req, res) => {
  const startTime = Date.now();
  const requestId = uuidv4();
  
  // Prepare Log Data Object
  const logData = {
    request_id: requestId,
    hosp_code: req.user ? req.user.hospcode : null, // Set by authenticateApiKey middleware
    api_key_id: req.user ? req.user.apiKeyId : null,
    endpoint: req.originalUrl,
    method: req.method,
    ip_address: req.ip || req.connection.remoteAddress,
    user_agent: req.get('User-Agent'),
    records_received: 0,
    success: 0,
    data_date_start: null,
    data_date_end: null
  };

  const finalizeLog = async (statusCode, errorMessage = null, errorDetail = null, errorCode = null, failedHn = null) => {
    logData.status_code = statusCode;
    logData.duration_ms = Date.now() - startTime;
    logData.success = statusCode >= 200 && statusCode < 300 ? 1 : 0;
    logData.error_message = errorMessage;
    logData.error_detail = errorDetail;
    logData.error_code = errorCode;
    logData.failed_hn = failedHn;
    
    // Fire and forget logging
    insertApiLog(logData).catch(err => console.error("Logging failed", err));
  };

  try {
    if (!req.body.data) {
      await finalizeLog(400, "Missing data payload", null, "MISSING_PAYLOAD");
      return res.status(400).json({ message: "Missing data payload" });
    }

    // 1. Decrypt
    let decryptedData;
    try {
      decryptedData = decryptData(req.body.data);
    } catch (err) {
      await finalizeLog(400, "Decryption failed", err.message, "DECRYPTION_ERROR");
      return res.status(400).json({ message: "Decryption failed", error: err.message });
    }

    // 2. Decompress
    zlib.gunzip(decryptedData, async (err, decompressedData) => {
      if (err) {
        await finalizeLog(400, "Decompression failed", err.message, "DECOMPRESSION_ERROR");
        return res.status(400).json({ message: "Decompression failed", error: err.message });
      }

      let data;
      try {
        data = JSON.parse(decompressedData.toString());
      } catch (parseErr) {
        await finalizeLog(400, "Invalid JSON", parseErr.message, "JSON_PARSE_ERROR");
        return res.status(400).json({ message: "Invalid JSON", error: parseErr.message });
      }

      if (!Array.isArray(data)) {
        await finalizeLog(400, "Data is not an array", null, "INVALID_FORMAT");
        return res.status(400).json({ message: "Data must be an array" });
      }

      logData.records_received = data.length;

      // 3. Validate & Transform
      const validRecords = [];
      let minDate = null;
      let maxDate = null;

      for (let i = 0; i < data.length; i++) {
        let record = data[i];

        // Capture date range
        if (record.date_serv) {
            const d = new Date(record.date_serv);
            if (!minDate || d < minDate) minDate = d;
            if (!maxDate || d > maxDate) maxDate = d;
        }

        if (record.diagcode) {
          record.diagcode = cleanDiagcode(record.diagcode);
        }

        const { error, value } = smogImportSchema.validate(record);
        if (error) {
          const msg = `Validation error at index ${i}: ${error.details[0].message}`;
          await finalizeLog(400, msg, JSON.stringify(record), "VALIDATION_ERROR", record.hn);
          return res.status(400).json({ message: msg });
        }

        validRecords.push([
          value.hospcode, value.pid, value.birth, value.sex, value.addrcode,
          value.hn, value.seq, value.date_serv, value.diagtype, value.diagcode,
          value.clinic, value.provider, value.d_update, value.cid,
          value.appoint, value.admit, value.er,
        ]);
      }
      
      if (minDate) logData.data_date_start = minDate;
      if (maxDate) logData.data_date_end = maxDate;

      if (validRecords.length === 0) {
        await finalizeLog(400, "No valid records to process", null, "NO_RECORDS");
        return res.status(400).json({ message: "No valid records" });
      }

      // 4. Database Transaction
      const connection = await db.getConnection();
      try {
        await connection.beginTransaction();

        await insertSmogImport(connection, validRecords);
        await insertApiImport(connection, req.user.hospcode, req.body.method || 1, validRecords.length);

        await connection.commit();
        connection.release();

        await finalizeLog(200);
        return res.json({
          message: "Data imported successfully",
          records_imported: validRecords.length,
          request_id: requestId
        });

      } catch (dbErr) {
        await connection.rollback();
        connection.release();
        await finalizeLog(500, "Database Transaction Error", dbErr.message, "DB_TRANSACTION_ERROR");
        return res.status(500).json({ message: "Internal server error" });
      }
    });
  } catch (globalErr) {
    await finalizeLog(500, "Unexpected Error", globalErr.message, "INTERNAL_ERROR");
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { handleSmogImportV2 };
