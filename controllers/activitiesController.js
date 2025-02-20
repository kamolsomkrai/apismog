// src/controllers/activitiesController.js
const pool = require("../config/db");

exports.getActivities = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM activities");
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.createActivity = async (req, res) => {
  const { measure_type, activity_date } = req.body;
  const { hospcode, provcode } = req.user;
  if (!hospcode || !measure_type || !activity_date) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO activities (hospcode, provcode, measure_type, activity_date) VALUES (?, ?, ?, ?)",
      [hospcode, provcode, measure_type, activity_date]
    );
    res
      .status(201)
      .json({ message: "Activity created successfully", id: result.insertId });
  } catch (error) {
    console.error("Error creating activity:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
