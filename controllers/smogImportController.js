// controllers/smogImportController.js
const zlib = require("zlib");
const crypto = require("crypto");
const {
  getSmogImportRecords,
  insertSmogImport,
  insertApiImport,
} = require("../models/smogImportModel");
const smogImportSchema = require("../validation/smogImportValidation");
const cleanDiagcode = require("../helpers/cleanDiagcode");
const db = require("../config/db");
require("dotenv").config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY.trim(); // key 32 bytes
const ENCRYPTION_IV = process.env.ENCRYPTION_IV.trim();

function decryptData(encryptedData) {
  // console.debug("Starting decryption process...");
  const encryptedBuffer = Buffer.from(encryptedData, "base64");

  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY, "utf8"),
    Buffer.from(ENCRYPTION_IV, "utf8")
  );

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
  // console.debug("Received smog import request with body:", req.body);
  const encryptedData = req.body.data;
  let decryptedData;
  try {
    decryptedData = decryptData(encryptedData);
  } catch (decErr) {
    console.error("Decryption failed:", decErr);
    res.locals.errorMessage = "Decryption failed: " + decErr.message;
    return res
      .status(400)
      .json({ message: "Decryption failed.", error: decErr.toString() });
  }

  // Decompress
  zlib.gunzip(decryptedData, async (err, decompressedData) => {
    if (err) {
      console.error("Decompression error:", err);
      res.locals.errorMessage = "Decompression failed: " + err.message;
      return res
        .status(400)
        .json({ message: "Decompression failed.", error: err.toString() });
    }

    let data;
    try {
      data = JSON.parse(decompressedData.toString());
    } catch (parseErr) {
      console.error("JSON Parse error:", parseErr);
      res.locals.errorMessage = "Invalid JSON data: " + parseErr.message;
      return res
        .status(400)
        .json({ message: "Invalid JSON data.", error: parseErr.toString() });
    }

    if (!Array.isArray(data)) {
      console.error("Data is not an array:", data);
      res.locals.errorMessage = "Data should be an array of records.";
      return res
        .status(400)
        .json({ message: "Data should be an array of records." });
    }

    // Validate
    const validRecords = [];
    for (let i = 0; i < data.length; i++) {
      let record = data[i];
      if (record.diagcode) {
        record.diagcode = cleanDiagcode(record.diagcode);
      }

      const { error, value } = smogImportSchema.validate(record);
      if (error) {
        const msg = `Validation error in record ${i + 1}: ${error.details[0].message}`;
        console.error("Validation error:", msg);
        res.locals.errorMessage = msg;
        return res.status(400).json({
          message: msg,
        });
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

    if (validRecords.length === 0) {
      console.debug("ไม่มี records ที่จะประมวลผล");
      res.locals.errorMessage = "No records to process.";
      return res.status(400).json({ message: "ไม่มี records ที่จะประมวลผล" });
    }

    const recordCount = validRecords.length;
    const hospcode = req.user.hospcode;

    try {
      const connection = await db.getConnection();
      // console.debug("Database connection acquired.");
      try {
        await connection.beginTransaction();
        // console.debug("Transaction started.");

        await insertSmogImport(connection, validRecords);
        // console.debug("Bulk insert executed.");

        await insertApiImport(
          connection,
          hospcode,
          req.body.method || 0,
          recordCount
        );
        // console.debug("Insert api_imports executed.");

        await connection.commit();
        // console.debug("Transaction committed.");
        connection.release();

        // LOGGING CONTEXT
        res.locals.recordCount = recordCount;

        res.json({
          message: "Data received and stored successfully.",
          records_imported: recordCount,
        });
      } catch (dbErr) {
        await connection.rollback();
        connection.release();
        console.error("Database error during transaction:", dbErr);
        res.locals.errorMessage = "Database transaction error: " + dbErr.message;
        res.locals.errorDetail = dbErr.stack;
        res
          .status(500)
          .json({ message: "Internal server error.", error: dbErr.toString() });
      }
    } catch (connErr) {
      console.error("Database connection error:", connErr);
      res.locals.errorMessage = "Database connection error: " + connErr.message;
      res
        .status(500)
        .json({ message: "Internal server error.", error: connErr.toString() });
    }
  });
};

const getSmogImportRecordsHandler = async (req, res) => {
  const { hospcode } = req.user;
  console.debug("Request to fetch smog import records for hospcode:", hospcode);
  try {
    const records = await getSmogImportRecords(hospcode);
    res.json(records);
  } catch (err) {
    console.error("Error fetching records:", err);
    res
      .status(500)
      .json({ message: "Internal server error.", error: err.toString() });
  }
};

module.exports = {
  handleSmogImport,
  getSmogImportRecordsHandler,
};
