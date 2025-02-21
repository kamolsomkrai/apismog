// controllers/smogImportController.js
const zlib = require("zlib");
const crypto = require("crypto");
const { getSmogImportRecords } = require("../models/smogImportModel");
const smogImportSchema = require("../validation/smogImportValidation");
const cleanDiagcode = require("../helpers/cleanDiagcode");
const db = require("../config/db");
require("dotenv").config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY.trim(); // key 32 bytes
const ENCRYPTION_IV = process.env.ENCRYPTION_IV.trim();

function decryptData(encryptedData) {
  // แปลงข้อมูลที่เข้ามาจาก base64 เป็น Buffer
  const encryptedBuffer = Buffer.from(encryptedData, "base64");
  console.log("Encrypted buffer length:", encryptedBuffer.length);

  // สร้าง decipher โดยใช้ algorithm 'aes-256-cbc'
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY, "utf8"),
    Buffer.from(ENCRYPTION_IV, "utf8")
  );

  // ถอดรหัสข้อมูล
  let decrypted;
  try {
    decrypted = Buffer.concat([
      decipher.update(encryptedBuffer),
      decipher.final(),
    ]);
  } catch (err) {
    console.error("Decryption error:", err);
    throw err;
  }
  return decrypted;
}

const handleSmogImport = async (req, res) => {
  // รับข้อมูล encrypted (ซึ่งถูก compress แล้ว) จาก req.body.data
  const encryptedData = req.body.data;
  let decryptedData;
  try {
    decryptedData = decryptData(encryptedData);
  } catch (decErr) {
    console.error("Decryption error:", decErr);
    return res
      .status(400)
      .json({ message: "Decryption failed.", data: decErr.toString() });
  }

  // Decompress ข้อมูลที่ถูกถอดรหัส
  zlib.gunzip(decryptedData, async (err, decompressedData) => {
    if (err) {
      console.error("Decompression error:", err);
      return res.status(400).json({ message: "Decompression failed." });
    }

    let data;
    try {
      data = JSON.parse(decompressedData.toString());
    } catch (parseErr) {
      console.error("JSON Parse error:", parseErr);
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
        console.error("Database error:", dbErr);
        res
          .status(500)
          .json({ message: "Internal server error.", error: dbErr.toString() });
      }
    } catch (connErr) {
      console.error("Connection error:", connErr);
      res
        .status(500)
        .json({ message: "Internal server error.", error: connErr.toString() });
    }
  });
};

const getSmogImportRecordsHandler = async (req, res) => {
  const { hospcode } = req.user;
  try {
    const records = await getSmogImportRecords(hospcode);
    res.json(records);
  } catch (err) {
    console.error("Get records error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
  handleSmogImport,
  getSmogImportRecordsHandler,
};
