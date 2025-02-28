// src/controllers/activitiesController.js
const pool = require("../config/db2");

exports.getActivities = async (req, res) => {
  try {
    // ดึงข้อมูลกิจกรรมจากตาราง activity (ตาม schema ที่ออกแบบไว้)
    const [rows] = await pool.query("SELECT * FROM activity");
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.createActivity = async (req, res) => {
  // คาดหวังว่า req.body จะมี activity_type, activity_date และ year
  // ส่วน req.user ควรมี hosp_code, prov_code และ dist_code
  const { activityType, year } = req.body;
  const { hospcode, provcode, distcode } = req.user; // สมมุติว่าคีย์ใน req.user ตรงกับ schema

  if (!hospcode || !provcode || !distcode || !activity_type || !year) {
    return res.status(400).json({ error: req.user });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO activity 
       (activity_type,hosp_code, prov_code, dist_code, year) 
       VALUES (?, ?, ?, ?, ?)`,
      [activityType, hospcode, provcode, distcode, year]
    );
    res
      .status(201)
      .json({ message: "Activity created successfully", id: result.insertId });
  } catch (error) {
    console.error("Error creating activity:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
