// src/controllers/measure1Controller.js
const pool = require("../config/db2");

exports.getMeasure1 = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.provname as province,
             COUNT(m.activity_name) as measure1_count
      FROM measure1 m
      JOIN activities a ON m.activity_id = a.id
      JOIN hospitals c ON a.hospcode = c.hospcode
      JOIN provinces p ON c.provcode = p.provcode
      GROUP BY p.provname;
    `);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching Measure1 data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateMeasure1 = async (req, res) => {
  // ใช้ key ใหม่ให้ตรงกับตาราง: activity_name, activity_detail, activity_date, year
  const { activityId, activityDetail, activityDate, year, files } = req.body;

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
        "INSERT INTO measure1 (activity_id, activity_detail, activity_date, year) VALUES (?, ?, ?, ?)",
        [activityId, activityDetail, activityDate, year]
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
