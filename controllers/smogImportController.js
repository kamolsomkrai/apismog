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
  console.debug("Starting decryption process...");
  // แปลงข้อมูลที่เข้ามาจาก base64 เป็น Buffer
  const encryptedBuffer = Buffer.from(encryptedData, "base64");
  //   console.debug("Encrypted buffer length:", encryptedBuffer.length);

  // สร้าง decipher โดยใช้ algorithm 'aes-256-cbc'
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
    // console.debug(
    //   "Decryption successful. Decrypted data length:",
    //   decrypted.length
    // );
  } catch (err) {
    console.error("Decryption error:", err);
    throw err;
  }
  return decrypted;
}

const handleSmogImport = async (req, res) => {
  // console.debug("Received smog import request with body:", req.body);
  // รับข้อมูล encrypted (ซึ่งถูก compress แล้ว) จาก req.body.data
  const encryptedData = req.body.data;
  let decryptedData;
  try {
    decryptedData = decryptData(encryptedData);
  } catch (decErr) {
    console.error("Decryption failed:", decErr);
    return res
      .status(400)
      .json({ message: "Decryption failed.", error: decErr.toString() });
  }

  // Decompress ข้อมูลที่ถูกถอดรหัส
  zlib.gunzip(decryptedData, async (err, decompressedData) => {
    if (err) {
      console.error("Decompression error:", err);
      return res
        .status(400)
        .json({ message: "Decompression failed.", error: err.toString() });
    }
    console.debug(
      "Decompression successful. Data length:",
      decompressedData.length
    );

    let data;
    try {
      data = JSON.parse(decompressedData.toString());
      //   console.debug("JSON parsed successfully. Parsed data:", data);
    } catch (parseErr) {
      console.error("JSON Parse error:", parseErr);
      return res
        .status(400)
        .json({ message: "Invalid JSON data.", error: parseErr.toString() });
    }

    if (!Array.isArray(data)) {
      console.error("Data is not an array:", data);
      return res
        .status(400)
        .json({ message: "Data should be an array of records." });
    }

    // Validate และ clean แต่ละ record
    const validRecords = [];
    for (let i = 0; i < data.length; i++) {
      let record = data[i];
      //   console.debug(`Validating record ${i + 1}:`, record);
      if (record.diagcode) {
        record.diagcode = cleanDiagcode(record.diagcode);
        // console.debug(`Cleaned diagcode for record ${i + 1}:`, record.diagcode);
      }

      const { error, value } = smogImportSchema.validate(record);
      if (error) {
        console.error(
          `Validation error in record ${i + 1}:`,
          error.details[0].message
        );
        return res.status(400).json({
          message: `Validation error in record ${i + 1}: ${
            error.details[0].message
          }`,
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
    // console.debug("All records validated. Valid records:", validRecords);

    const recordCount = validRecords.length;
    const hospcode = req.user.hospcode;
    console.debug(
      "Total records to process:",
      recordCount,
      "for hospcode:",
      hospcode
    );

    try {
      const connection = await db.getConnection();
      console.debug("Database connection acquired.");
      try {
        await connection.beginTransaction();
        console.debug("Transaction started.");

        // Bulk insert/update ในตาราง smog_import
        await insertSmogImport(connection, validRecords);
        console.debug("Bulk insert/update into smog_import executed.");

        // Insert log ลง api_imports
        await insertApiImport(
          connection,
          hospcode,
          req.body.method || 0,
          recordCount
        );
        console.debug("Insert into api_imports executed.");

        await connection.commit();
        console.debug("Transaction committed successfully.");
        connection.release();

        res.json({
          message: "Data received and stored successfully.",
          records_imported: recordCount,
        });
      } catch (dbErr) {
        await connection.rollback();
        connection.release();
        console.error("Database error during transaction:", dbErr);
        res
          .status(500)
          .json({ message: "Internal server error.", error: dbErr.toString() });
      }
    } catch (connErr) {
      console.error("Database connection error:", connErr);
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
    // console.debug("Records fetched successfully:", records);
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
