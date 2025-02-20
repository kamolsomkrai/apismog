// models/SmogImportModel.js
const pool = require("../config/db");

const insertSmogImport = async (connection, records) => {
  const sql = `
        INSERT INTO smog_import 
        (hospcode, pid, birth, sex, addrcode, hn, seq, date_serv, diagtype, diagcode, clinic, provider, d_update, cid, appoint, admit, er)
        VALUES ?
    `;
  await connection.query(sql, [records]);
};

const insertApiImport = async (connection, hospcode, method, rec) => {
  const sql = `
        INSERT INTO api_imports (hospcode, method, rec)
        VALUES (?, ?, ?)
    `;
  await connection.query(sql, [hospcode, method, rec]);
};

const getSmogImportRecords = async (hospcode) => {
  const [rows] = await pool.query(
    "SELECT * FROM smog_import WHERE hospcode = ?",
    [hospcode]
  );
  return rows;
};

module.exports = {
  insertSmogImport,
  insertApiImport,
  getSmogImportRecords,
};
