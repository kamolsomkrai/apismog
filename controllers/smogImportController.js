// controllers/smogImportController.js
const zlib = require("zlib");
const { getSmogImportRecords } = require("../models/smogImportModel");
const smogImportSchema = require("../validation/smogImportValidation");
const cleanDiagcode = require("../helpers/cleanDiagcode");
const db = require("../config/db");

const handleSmogImport = async (req, res) => {
  // รับข้อมูล JSON โดยตรงจาก req.body.data
  let data;
  try {
    data = JSON.parse(req.body.data);
  } catch (parseErr) {
    return res.status(400).json({ message: "Invalid JSON data." });
  }

  if (!Array.isArray(data)) {
    return res
      .status(400)
      .json({ message: "Data should be an array of records." });
  }

  // Validate และ clean แต่ละ record
  const validRecords = [];
  for (let record of data) {
    if (record.diagcode) {
      record.diagcode = cleanDiagcode(record.diagcode);
    }

    const { error, value } = smogImportSchema.validate(record);
    if (error) {
      return res
        .status(400)
        .json({ message: `Validation error: ${error.details[0].message}` });
    }
    validRecords.push([
      value.hospcode,
      value.pid,
      value.birth,
      value.sex,
      value.addrcode,
      value.hn,
      value.seq,
      value.date_serv,
      value.diagtype,
      value.diagcode,
      value.clinic,
      value.provider,
      value.d_update,
      value.cid,
      value.appoint,
      value.admit,
      value.er,
    ]);
  }

  const recordCount = validRecords.length;
  const hospcode = req.user.hospcode;

  try {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const insertSmogSql = `
          INSERT INTO smog_import 
          (hospcode, pid, birth, sex, addrcode, hn, seq, date_serv, diagtype, diagcode, clinic, provider, d_update, cid, appoint, admit, er)
          VALUES ?
        `;
      await connection.query(insertSmogSql, [validRecords]);

      const insertApiImportsSql = `
          INSERT INTO api_imports (hospcode, method, rec)
          VALUES (?, ?, ?)
        `;
      await connection.query(insertApiImportsSql, [
        hospcode,
        req.body.method || 0,
        recordCount,
      ]);

      await connection.commit();
      connection.release();

      res.json({
        message: "Data received and stored successfully.",
        records_imported: recordCount,
      });
    } catch (dbErr) {
      await connection.rollback();
      connection.release();
      res.status(500).json({ message: "Internal server error." });
    }
  } catch (connErr) {
    res.status(500).json({ message: "Internal server error." });
  }
};

const getSmogImportRecordsHandler = async (req, res) => {
  const { hospcode } = req.user;

  try {
    const records = await getSmogImportRecords(hospcode);
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
  handleSmogImport,
  getSmogImportRecordsHandler,
};
