// src/controllers/measure1Controller.js
const pool = require("../config/db2");

exports.getMeasure1 = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.provname as province,
      count(m1.sub_measure_1_1) as measure1_1,
      count(m1.sub_measure_1_2) as measure1_2
      FROM measure_1 m1
      JOIN 
          activities a ON m1.activity_id = a.id
      JOIN 
          chospital c ON a.hospcode = c.hoscode
      JOIN 
          cchangwat p ON c.provcode = p.provcode
      GROUP BY 
          p.provname;`);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching Measure1 data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.createMeasure1 = async (req, res) => {
  const { activity_id, sub_measure_1_1, sub_measure_1_2 } = req.body;

  if (!activity_id || !sub_measure_1_1 || !sub_measure_1_2) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO measure_1 (activity_id, sub_measure_1_1, sub_measure_1_2) VALUES (?, ?, ?)",
      [activity_id, sub_measure_1_1, sub_measure_1_2]
    );
    res.status(201).json({
      message: "Measure1 data created successfully",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error creating Measure1 data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
