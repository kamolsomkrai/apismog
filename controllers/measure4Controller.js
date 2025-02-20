// src/controllers/measure4Controller.js
const pool = require("../config/db2");

exports.getMeasure4 = async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT p.provname AS province, m4.* 
      FROM measure_4 m4
      JOIN 
          activities a ON m4.activity_id = a.id
      JOIN 
          chospital c ON a.hospcode = c.hoscode
      JOIN 
          cchangwat p ON c.provcode = p.provcode
      GROUP BY 
          p.provname`);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching Measure4 data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.createMeasure4 = async (req, res) => {
  const { activity_id, eoc_open_date, eoc_close_date, law_enforcement_fine } =
    req.body;

  // ปรับเงื่อนไขการตรวจสอบค่า ไม่ตรวจสอบ eoc_close_date
  if (!activity_id || !eoc_open_date || law_enforcement_fine === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // จัดการค่า eoc_close_date ถ้าเป็นค่าว่างหรือ undefined ให้ตั้งค่าเป็น NULL
    const eocCloseDate = eoc_close_date ? eoc_close_date : null;

    const [result] = await pool.query(
      `INSERT INTO measure_4 
        (activity_id, eoc_open_date, eoc_close_date, law_enforcement_fine) 
        VALUES (?, ?, ?, ?)`,
      [activity_id, eoc_open_date, eocCloseDate, law_enforcement_fine]
    );
    res.status(201).json({
      message: "Measure4 data created successfully",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error creating Measure4 data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
