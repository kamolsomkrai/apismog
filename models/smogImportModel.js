// models/smogImportModel.js
const pool = require("../config/db");

const insertSmogImport = async (connection, records) => {
  const sql = `
    INSERT INTO smog_import 
    (hospcode, pid, birth, sex, addrcode, hn, seq, date_serv, diagtype, diagcode, clinic, provider, d_update, cid, appoint, admit, er)
    VALUES ?
    ON DUPLICATE KEY UPDATE
    addrcode = VALUES(addrcode),
    diagtype = VALUES(diagtype),
    clinic = VALUES(clinic),
    d_update = VALUES(d_update),
    appoint = VALUES(appoint),
    admit = VALUES(admit),
    er = VALUES(er)
  `;
  // console.debug("Executing bulk insert/update with records:", records);
  await connection.query(sql, [records]);
};

const insertApiImport = async (connection, hospcode, method, rec) => {
  const sql = `
    INSERT INTO api_imports (hospcode, method, rec)
    VALUES (?, ?, ?)
  `;
  console.debug("Executing api_imports insert with:", hospcode, method, rec);
  await connection.query(sql, [hospcode, method, rec]);
};

const getSmogImportRecords = async (hospcode) => {
  console.debug("Fetching smog_import records for hospcode:", hospcode);
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
