// src/controllers/measure1Controller.js
// const pool = require("../config/db1");
const pool = require("../config/db2");
const poolsmog = require("../config/db3");

exports.getMeasure1 = async (req, res) => {
  try {
    const [rows] = await poolsmog.query(`
      SELECT
        p.provname,
        a.activity_id AS activityType,
        ca.des AS description,
        YEAR(activity_date) AS activityYear,
        COUNT( a.activity_id ) AS activityCount
      FROM
        activity_datas a
        JOIN chospital ch ON ch.hoscode = a.hospcode
        JOIN provinces p ON ch.provcode = p.provcode
        JOIN c_activity ca ON ca.id = a.activity_id 
      GROUP BY
        a.activity_id,
        p.provcode,
        YEAR(activity_date)
    `);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching Measure1 data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateMeasure1 = async (req, res) => {
  // ใช้ key ใหม่ให้ตรงกับตาราง: activity_name, activity_detail, activity_date, year
  const {
    activityId,
    activityCatalog,
    activityDetail,
    activityDate,
    year,
    files,
  } = req.body;

  if (!activityId) {
    return res.status(400).json({ error: "Missing activity_id" });
  }

  try {
    // พยายาม update record ในตาราง measure1 ถ้ามีอยู่แล้ว
    const [result] = await pool.query(
      "UPDATE measure1 SET activity_detail = ? WHERE activity_id = ?",
      [activityDetail, activityId]
    );

    let measure1_id;
    if (result.affectedRows === 0) {
      // ถ้ายังไม่มี record ให้ insert ใหม่ โดยต้องระบุ activity_date และ year ด้วย
      const [insertResult] = await pool.query(
        "INSERT INTO measure1 (activity_id, activity_catalog, activity_detail, activity_date, year) VALUES (?, ?, ?, ?, ?)",
        [activityId, activityCatalog, activityDetail, activityDate, year]
      );
      measure1_id = insertResult.insertId;
    } else {
      // ดึง measure1_id จาก record ที่อัปเดตแล้ว
      const [rows] = await pool.query(
        "SELECT measure1_id FROM measure1 WHERE activity_id = ?",
        [activityId]
      );
      measure1_id = rows[0].measure1_id;
    }

    // ถ้ามีไฟล์อัปโหลด ให้ลบข้อมูลไฟล์เก่าออกแล้ว insert ไฟล์ใหม่
    if (files && Array.isArray(files)) {
      await pool.query("DELETE FROM measure1_upload WHERE measure1_id = ?", [
        measure1_id,
      ]);
      for (const file of files) {
        // ใช้ year ที่ส่งมาจาก request (หรือสามารถใช้ file.year หากมี)
        const fileYear = file.year || year;
        await pool.query(
          "INSERT INTO measure1_upload (measure1_id, file_path, file_name, file_type, extension, file_size, year) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [
            measure1_id,
            file.filePath,
            file.fileName,
            file.fileType,
            file.extension,
            file.fileSize,
            fileYear,
          ]
        );
      }
    }

    res.status(200).json({ message: "Measure1 data updated successfully" });
  } catch (error) {
    console.error("Error updating Measure1 data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
