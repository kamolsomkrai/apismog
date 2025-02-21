// src/controllers/measure2Controller.js
const pool = require("../config/db2");

exports.getMeasure2 = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        p.provname AS province,
        CAST(m2.risk_health_monitoring_1_1 AS UNSIGNED) AS risk_health_monitoring_1_1,
        CAST(m2.risk_health_monitoring_1_2 AS UNSIGNED) AS risk_health_monitoring_1_2,
        CAST(m2.child AS UNSIGNED) AS child,
        CAST(m2.elderly AS UNSIGNED) AS elderly,
        CAST(m2.pregnant AS UNSIGNED) AS pregnant,
        CAST(m2.bedridden AS UNSIGNED) AS bedridden,
        CAST(m2.asthma AS UNSIGNED) AS asthma,
        CAST(m2.copd AS UNSIGNED) AS copd,
        CAST(m2.asthma_copd AS UNSIGNED) AS asthma_copd,
        CAST(m2.health_check_staff AS UNSIGNED) AS health_check_staff,
        CAST(m2.health_check_volunteer AS UNSIGNED) AS health_check_volunteer
      FROM 
          measure_2 m2
      JOIN 
          activities a ON m2.activity_id = a.id
      JOIN 
          hospitals c ON a.hospcode = c.hospcode
      JOIN 
          provinces p ON c.provcode = p.provcode
      GROUP BY 
          p.provname;`
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching Measure2 data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.createMeasure2 = async (req, res) => {
  const {
    activity_id,
    risk_health_monitoring_1_1,
    risk_health_monitoring_1_2,
    child,
    elderly,
    pregnant,
    bedridden,
    asthma,
    copd,
    asthma_copd,
    health_check_staff,
    health_check_volunteer,
  } = req.body;

  if (
    !activity_id ||
    risk_health_monitoring_1_1 === undefined ||
    risk_health_monitoring_1_2 === undefined ||
    child === undefined ||
    elderly === undefined ||
    pregnant === undefined ||
    bedridden === undefined ||
    asthma === undefined ||
    copd === undefined ||
    asthma_copd === undefined ||
    health_check_staff === undefined ||
    health_check_volunteer === undefined
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO measure_2 
        (activity_id, risk_health_monitoring_1_1, risk_health_monitoring_1_2, child, elderly, pregnant, bedridden, asthma, copd, asthma_copd, health_check_staff, health_check_volunteer) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        activity_id,
        risk_health_monitoring_1_1,
        risk_health_monitoring_1_2,
        child,
        elderly,
        pregnant,
        bedridden,
        asthma,
        copd,
        asthma_copd,
        health_check_staff,
        health_check_volunteer,
      ]
    );
    res.status(201).json({
      message: "Measure2 data created successfully",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error creating Measure2 data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
