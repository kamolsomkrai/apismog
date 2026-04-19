// models/apiLogsModel.js
const pool = require("../config/db");

const insertApiLog = async (logData) => {
  const sql = `
    INSERT INTO api_logs 
    (request_id, hosp_code, api_key_id, endpoint, method, status_code, success, error_message, error_detail, ip_address, user_agent, duration_ms, records_received, data_date_start, data_date_end, failed_hn, error_code)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const values = [
    logData.request_id,
    logData.hosp_code,
    logData.api_key_id,
    logData.endpoint,
    logData.method,
    logData.status_code,
    logData.success,
    logData.error_message,
    logData.error_detail,
    logData.ip_address,
    logData.user_agent,
    logData.duration_ms,
    logData.records_received,
    logData.data_date_start,
    logData.data_date_end,
    logData.failed_hn,
    logData.error_code
  ];

  try {
      const [result] = await pool.query(sql, values);
      return result.insertId;
  } catch (err) {
      console.error("Failed to insert API log:", err);
      // Don't throw, just log error locally to avoid breaking the response flow if logging fails
      return null;
  }
};

module.exports = {
  insertApiLog,
};
