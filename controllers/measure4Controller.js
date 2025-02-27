// src/controllers/measure4Controller.js
const pool = require("../config/db2");

exports.getMeasure4 = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.provname AS province,
        m4.activity_id,
        m4.open_pheoc_date AS openPheocDate,
        m4.close_pheoc_date AS closePheocDate,
        m4.open_dont_burn_date AS openDontBurnDate,
        m4.close_dont_burn_date AS closeDontBurnDate,
        m4.law_enforcement AS lawEnforcement,
        m4.year,
        m4.created_at,
        m4.updated_at
      FROM measure4 m4
      JOIN activity a ON m4.activity_id = a.activity_id
      JOIN hospitals c ON a.hosp_code = c.hosp_code
      JOIN provinces p ON c.prov_code = p.prov_code
      GROUP BY p.provname
    `);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching Measure4 data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.createMeasure4 = async (req, res) => {
  const {
    activity_id,
    openPheocDate,
    closePheocDate,
    openDontBurnDate,
    closeDontBurnDate,
    lawEnforcement,
    year,
  } = req.body;

  // ตรวจสอบว่ามีข้อมูลที่จำเป็นครบถ้วนหรือไม่
  if (!activity_id || !openPheocDate || lawEnforcement === undefined || !year) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // ถ้าค่า closePheocDate, openDontBurnDate, closeDontBurnDate เป็นค่าว่างหรือ undefined ให้ตั้งเป็น NULL
    const _closePheocDate = closePheocDate ? closePheocDate : null;
    const _openDontBurnDate = openDontBurnDate ? openDontBurnDate : null;
    const _closeDontBurnDate = closeDontBurnDate ? closeDontBurnDate : null;

    const [result] = await pool.query(
      `INSERT INTO measure4 
        (activity_id, open_pheoc_date, close_pheoc_date, open_dont_burn_date, close_dont_burn_date, law_enforcement, year) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        activity_id,
        openPheocDate,
        _closePheocDate,
        _openDontBurnDate,
        _closeDontBurnDate,
        lawEnforcement,
        year,
      ]
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
