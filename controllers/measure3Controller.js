// src/controllers/measure3Controller.js
const pool = require("../config/db2");

exports.getMeasure3 = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        p.provname AS province,
        CAST(m3.pollution_clinic_open AS UNSIGNED) AS pollution_clinic_open ,
        CAST(m3.pollution_clinic_service AS UNSIGNED) AS pollution_clinic_service ,
        CAST(m3.online_clinic_open AS UNSIGNED) AS online_clinic_open ,
        CAST(m3.online_clinic_service AS UNSIGNED) AS online_clinic_service ,
        CAST(m3.nursery_dust_free_open AS UNSIGNED) AS nursery_dust_free_open ,
        CAST(m3.nursery_dust_free_service AS UNSIGNED) AS nursery_dust_free_service ,
        CAST(m3.gov_dust_free_open AS UNSIGNED) AS gov_dust_free_open ,
        CAST(m3.gov_dust_free_service AS UNSIGNED) AS gov_dust_free_service ,
        CAST(m3.active_teams_3_doctors_total AS UNSIGNED) AS active_teams_3_doctors_total ,
        CAST(m3.active_teams_3_doctors_add AS UNSIGNED) AS active_teams_3_doctors_add ,
        CAST(m3.active_teams_mobile_total AS UNSIGNED) AS active_teams_mobile_total ,
        CAST(m3.active_teams_mobile_add AS UNSIGNED) AS active_teams_mobile_add ,
        CAST(m3.active_teams_citizens_total AS UNSIGNED) AS active_teams_citizens_total ,
        CAST(m3.active_teams_citizens_add AS UNSIGNED) AS active_teams_citizens_add ,
        CAST(m3.pop_N95_mask AS UNSIGNED) AS pop_N95_mask ,
        CAST(m3.pop_surgical_mask AS UNSIGNED) AS pop_surgical_mask ,
        CAST(m3.elderly_N95_mask AS UNSIGNED) AS elderly_N95_mask ,
        CAST(m3.elderly_surgical_mask AS UNSIGNED) AS elderly_surgical_mask ,
        CAST(m3.children_N95_mask AS UNSIGNED) AS children_N95_mask ,
        CAST(m3.children_surgical_mask AS UNSIGNED) AS children_surgical_mask ,
        CAST(m3.pregnant_N95_mask AS UNSIGNED) AS pregnant_N95_mask ,
        CAST(m3.pregnant_surgical_mask AS UNSIGNED) AS pregnant_surgical_mask ,
        CAST(m3.bedridden_N95_mask AS UNSIGNED) AS bedridden_N95_mask ,
        CAST(m3.bedridden_surgical_mask AS UNSIGNED) AS bedridden_surgical_mask ,
        CAST(m3.disease_N95_mask AS UNSIGNED) AS disease_N95_mask ,
        CAST(m3.disease_surgical_mask AS UNSIGNED) AS disease_surgical_mask ,
        CAST(m3.sky_doctor AS UNSIGNED) AS sky_doctor ,
        CAST(m3.ambulance AS UNSIGNED) AS ambulance 
      FROM 
          measure_3 m3
      JOIN 
          activities a ON m3.activity_id = a.id
      JOIN 
          chospital c ON a.hospcode = c.hoscode
      JOIN 
          cchangwat p ON c.provcode = p.provcode
      GROUP BY 
          p.provname`
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching Measure3 data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.createMeasure3 = async (req, res) => {
  const {
    activity_id,
    pollution_clinic_open,
    pollution_clinic_service,
    online_clinic_open,
    online_clinic_service,
    nursery_dust_free_open,
    nursery_dust_free_service,
    gov_dust_free_open,
    gov_dust_free_service,
    active_teams_3_doctors_total,
    active_teams_3_doctors_add,
    active_teams_mobile_total,
    active_teams_mobile_add,
    active_teams_citizens_total,
    active_teams_citizens_add,
    pop_N95_mask,
    pop_surgical_mask,
    elderly_N95_mask,
    elderly_surgical_mask,
    children_N95_mask,
    children_surgical_mask,
    pregnant_N95_mask,
    pregnant_surgical_mask,
    bedridden_N95_mask,
    bedridden_surgical_mask,
    disease_N95_mask,
    disease_surgical_mask,
    sky_doctor,
    ambulance,
  } = req.body;

  if (
    !activity_id ||
    pollution_clinic_open === undefined ||
    pollution_clinic_service === undefined ||
    online_clinic_open === undefined ||
    online_clinic_service === undefined ||
    nursery_dust_free_open === undefined ||
    nursery_dust_free_service === undefined ||
    gov_dust_free_open === undefined ||
    gov_dust_free_service === undefined ||
    active_teams_3_doctors_total === undefined ||
    active_teams_3_doctors_add === undefined ||
    active_teams_mobile_total === undefined ||
    active_teams_mobile_add === undefined ||
    active_teams_citizens_total === undefined ||
    active_teams_citizens_add === undefined ||
    pop_N95_mask === undefined ||
    pop_surgical_mask === undefined ||
    elderly_N95_mask === undefined ||
    elderly_surgical_mask === undefined ||
    children_N95_mask === undefined ||
    children_surgical_mask === undefined ||
    pregnant_N95_mask === undefined ||
    pregnant_surgical_mask === undefined ||
    bedridden_N95_mask === undefined ||
    bedridden_surgical_mask === undefined ||
    disease_N95_mask === undefined ||
    disease_surgical_mask === undefined ||
    sky_doctor === undefined ||
    ambulance === undefined
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO measure_3 
        (activity_id, pollution_clinic_open, pollution_clinic_service, online_clinic_open, online_clinic_service, nursery_dust_free_open, nursery_dust_free_service, gov_dust_free_open, gov_dust_free_service, active_teams_3_doctors_total, active_teams_3_doctors_add, active_teams_mobile_total, active_teams_mobile_add, active_teams_citizens_total, active_teams_citizens_add, pop_N95_mask, pop_surgical_mask, elderly_N95_mask, elderly_surgical_mask, children_N95_mask, children_surgical_mask, pregnant_N95_mask, pregnant_surgical_mask, bedridden_N95_mask, bedridden_surgical_mask, disease_N95_mask, disease_surgical_mask, sky_doctor, ambulance) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        activity_id,
        pollution_clinic_open,
        pollution_clinic_service,
        online_clinic_open,
        online_clinic_service,
        nursery_dust_free_open,
        nursery_dust_free_service,
        gov_dust_free_open,
        gov_dust_free_service,
        active_teams_3_doctors_total,
        active_teams_3_doctors_add,
        active_teams_mobile_total,
        active_teams_mobile_add,
        active_teams_citizens_total,
        active_teams_citizens_add,
        pop_N95_mask,
        pop_surgical_mask,
        elderly_N95_mask,
        elderly_surgical_mask,
        children_N95_mask,
        children_surgical_mask,
        pregnant_N95_mask,
        pregnant_surgical_mask,
        bedridden_N95_mask,
        bedridden_surgical_mask,
        disease_N95_mask,
        disease_surgical_mask,
        sky_doctor,
        ambulance,
      ]
    );
    res.status(201).json({
      message: "Measure3 data created successfully",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error creating Measure3 data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
