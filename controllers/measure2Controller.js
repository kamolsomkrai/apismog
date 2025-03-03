// src/controllers/measure2Controller.js
const pool = require("../config/db2");

exports.getMeasure2 = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.provname AS province,
        CAST(m2.risk_health_info AS UNSIGNED) AS risk_health_info,
        CAST(m2.risk_health_social AS UNSIGNED) AS risk_health_social,
        CAST(m2.risk_child_total AS UNSIGNED) AS risk_child_total,
        CAST(m2.risk_child_take_care AS UNSIGNED) AS risk_child_take_care,
        CAST(m2.risk_older_total AS UNSIGNED) AS risk_older_total,
        CAST(m2.risk_older_take_care AS UNSIGNED) AS risk_older_take_care,
        CAST(m2.risk_pregnant_total AS UNSIGNED) AS risk_pregnant_total,
        CAST(m2.risk_pregnant_take_care AS UNSIGNED) AS risk_pregnant_take_care,
        CAST(m2.risk_bedridden_total AS UNSIGNED) AS risk_bedridden_total,
        CAST(m2.risk_bedridden_take_care AS UNSIGNED) AS risk_bedridden_take_care,
        CAST(m2.risk_heart_total AS UNSIGNED) AS risk_heart_total,
        CAST(m2.risk_heart_take_care AS UNSIGNED) AS risk_heart_take_care,
        CAST(m2.risk_copd_total AS UNSIGNED) AS risk_copd_total,
        CAST(m2.risk_copd_take_care AS UNSIGNED) AS risk_copd_take_care,
        CAST(m2.healthcare_officer AS UNSIGNED) AS healthcare_officer
      FROM 
        measure2 m2
      JOIN 
        activity a ON m2.activity_id = a.activity_id
      JOIN 
        hospitals c ON a.hosp_code = c.hosp_code
      JOIN 
        provinces p ON c.prov_code = p.prov_code
      GROUP BY 
        p.provname;
    `);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching Measure2 data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.createMeasure2 = async (req, res) => {
  const {
    activityId,
    riskHealthInfo,
    riskHealthSocial,
    riskChildTotal,
    riskChildTakeCare,
    riskOlderTotal,
    riskOlderTakeCare,
    riskPregnantTotal,
    riskPregnantTakeCare,
    riskBedriddenTotal,
    riskBedriddenTakeCare,
    riskHeartTotal,
    riskHeartTakeCare,
    riskCopdTotal,
    riskCopdTakeCare,
    healthcareOfficer,
    year,
  } = req.body;

  if (
    !activityId ||
    riskHealthInfo === undefined ||
    riskHealthSocial === undefined ||
    riskChildTotal === undefined ||
    riskChildTakeCare === undefined ||
    riskOlderTotal === undefined ||
    riskOlderTakeCare === undefined ||
    riskPregnantTotal === undefined ||
    riskPregnantTakeCare === undefined ||
    riskBedriddenTotal === undefined ||
    riskBedriddenTakeCare === undefined ||
    riskHeartTotal === undefined ||
    riskHeartTakeCare === undefined ||
    riskCopdTotal === undefined ||
    riskCopdTakeCare === undefined ||
    healthcareOfficer === undefined ||
    !year
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO measure2 
        (activity_id, risk_health_info, risk_health_social, risk_child_total, risk_child_take_care, 
         risk_older_total, risk_older_take_care, risk_pregnant_total, risk_pregnant_take_care, 
         risk_bedridden_total, risk_bedridden_take_care, risk_heart_total, risk_heart_take_care, 
         risk_copd_total, risk_copd_take_care, healthcare_officer, year)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        activityId,
        riskHealthInfo,
        riskHealthSocial,
        riskChildTotal,
        riskChildTakeCare,
        riskOlderTotal,
        riskOlderTakeCare,
        riskPregnantTotal,
        riskPregnantTakeCare,
        riskBedriddenTotal,
        riskBedriddenTakeCare,
        riskHeartTotal,
        riskHeartTakeCare,
        riskCopdTotal,
        riskCopdTakeCare,
        healthcareOfficer,
        year,
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

exports.upsertMeasure2 = async (req, res) => {
  const {
    activityId,
    riskHealthInfo,
    riskHealthSocial,
    riskChildTotal,
    riskChildTakeCare,
    riskOlderTotal,
    riskOlderTakeCare,
    riskPregnantTotal,
    riskPregnantTakeCare,
    riskBedriddenTotal,
    riskBedriddenTakeCare,
    riskHeartTotal,
    riskHeartTakeCare,
    riskCopdTotal,
    riskCopdTakeCare,
    healthcareOfficer,
    year,
  } = req.body;
  console.log("Request body:", req.body);
  if (
    !activityId ||
    riskHealthInfo === undefined ||
    riskHealthSocial === undefined ||
    riskChildTotal === undefined ||
    riskChildTakeCare === undefined ||
    riskOlderTotal === undefined ||
    riskOlderTakeCare === undefined ||
    riskPregnantTotal === undefined ||
    riskPregnantTakeCare === undefined ||
    riskBedriddenTotal === undefined ||
    riskBedriddenTakeCare === undefined ||
    riskHeartTotal === undefined ||
    riskHeartTakeCare === undefined ||
    riskCopdTotal === undefined ||
    riskCopdTakeCare === undefined ||
    healthcareOfficer === undefined ||
    !year
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const [result] = await pool.query(
      `
      INSERT INTO measure2 
        (activity_id, risk_health_info, risk_health_social, risk_child_total, risk_child_take_care, 
         risk_older_total, risk_older_take_care, risk_pregnant_total, risk_pregnant_take_care, 
         risk_bedridden_total, risk_bedridden_take_care, risk_heart_total, risk_heart_take_care, 
         risk_copd_total, risk_copd_take_care, healthcare_officer, year)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
         risk_health_info = VALUES(risk_health_info),
         risk_health_social = VALUES(risk_health_social),
         risk_child_total = VALUES(risk_child_total),
         risk_child_take_care = VALUES(risk_child_take_care),
         risk_older_total = VALUES(risk_older_total),
         risk_older_take_care = VALUES(risk_older_take_care),
         risk_pregnant_total = VALUES(risk_pregnant_total),
         risk_pregnant_take_care = VALUES(risk_pregnant_take_care),
         risk_bedridden_total = VALUES(risk_bedridden_total),
         risk_bedridden_take_care = VALUES(risk_bedridden_take_care),
         risk_heart_total = VALUES(risk_heart_total),
         risk_heart_take_care = VALUES(risk_heart_take_care),
         risk_copd_total = VALUES(risk_copd_total),
         risk_copd_take_care = VALUES(risk_copd_take_care),
         healthcare_officer = VALUES(healthcare_officer)
      `,
      [
        activityId,
        riskHealthInfo,
        riskHealthSocial,
        riskChildTotal,
        riskChildTakeCare,
        riskOlderTotal,
        riskOlderTakeCare,
        riskPregnantTotal,
        riskPregnantTakeCare,
        riskBedriddenTotal,
        riskBedriddenTakeCare,
        riskHeartTotal,
        riskHeartTakeCare,
        riskCopdTotal,
        riskCopdTakeCare,
        healthcareOfficer,
        year,
      ]
    );
    res.status(200).json({
      message: "Measure2 data upserted successfully",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error upserting Measure2 data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getMeasure2show = async (req, res) => {
  const { hospcode } = req.user;
  try {
    const [rows] = await pool.query(
      `
      SELECT 
        m2.measure2_id AS id,
        p.provname AS province,
        CAST(m2.risk_health_info AS UNSIGNED) AS risk_health_info,
        CAST(m2.risk_health_social AS UNSIGNED) AS risk_health_social,
        CAST(m2.risk_child_total AS UNSIGNED) AS risk_child_total,
        CAST(m2.risk_child_take_care AS UNSIGNED) AS risk_child_take_care,
        CAST(m2.risk_older_total AS UNSIGNED) AS risk_older_total,
        CAST(m2.risk_older_take_care AS UNSIGNED) AS risk_older_take_care,
        CAST(m2.risk_pregnant_total AS UNSIGNED) AS risk_pregnant_total,
        CAST(m2.risk_pregnant_take_care AS UNSIGNED) AS risk_pregnant_take_care,
        CAST(m2.risk_bedridden_total AS UNSIGNED) AS risk_bedridden_total,
        CAST(m2.risk_bedridden_take_care AS UNSIGNED) AS risk_bedridden_take_care,
        CAST(m2.risk_heart_total AS UNSIGNED) AS risk_heart_total,
        CAST(m2.risk_heart_take_care AS UNSIGNED) AS risk_heart_take_care,
        CAST(m2.risk_copd_total AS UNSIGNED) AS risk_copd_total,
        CAST(m2.risk_copd_take_care AS UNSIGNED) AS risk_copd_take_care,
        CAST(m2.healthcare_officer AS UNSIGNED) AS healthcare_officer
      FROM 
        measure2 m2
      JOIN 
        activity a ON m2.activity_id = a.activity_id
      JOIN 
        hospitals c ON a.hosp_code = c.hospcode
      JOIN 
        provinces p ON c.provcode = p.provcode
      WHERE 
        a.hosp_code = ?
      GROUP BY 
        p.provname
      `,
      [hospcode]
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching Measure2 data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
