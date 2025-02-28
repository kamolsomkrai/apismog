// src/controllers/measure3Controller.js
const pool = require("../config/db2");

exports.getMeasure3 = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.provname AS province,
        CAST(m3.pollution_clinic_total AS UNSIGNED) AS pollution_clinic_total,
        CAST(m3.pollution_clini_service AS UNSIGNED) AS pollution_clini_service,
        CAST(m3.online_pollution_clinic_total AS UNSIGNED) AS online_pollution_clinic_total,
        CAST(m3.online_pollution_clini_service AS UNSIGNED) AS online_pollution_clini_service,
        CAST(m3.mosquito_net_total AS UNSIGNED) AS mosquito_net_total,
        CAST(m3.mosquito_net_service AS UNSIGNED) AS mosquito_net_service,
        CAST(m3.nursery_dust_free_total AS UNSIGNED) AS nursery_dust_free_total,
        CAST(m3.nursery_dust_free_service AS UNSIGNED) AS nursery_dust_free_service,
        CAST(m3.public_health_dust_free_total AS UNSIGNED) AS public_health_dust_free_total,
        CAST(m3.public_health_dust_free_service AS UNSIGNED) AS public_health_dust_free_service,
        CAST(m3.office_dust_free_total AS UNSIGNED) AS office_dust_free_total,
        CAST(m3.office_dust_free_service AS UNSIGNED) AS office_dust_free_service,
        CAST(m3.building_dust_free_total AS UNSIGNED) AS building_dust_free_total,
        CAST(m3.building_dust_free_service AS UNSIGNED) AS building_dust_free_service,
        CAST(m3.other_dust_free_total AS UNSIGNED) AS other_dust_free_total,
        CAST(m3.other_dust_free_service AS UNSIGNED) AS other_dust_free_service,
        CAST(m3.team3_doctor_total AS UNSIGNED) AS team3_doctor_total,
        CAST(m3.team3_doctor_service AS UNSIGNED) AS team3_doctor_service,
        CAST(m3.mobile_doctor_total AS UNSIGNED) AS mobile_doctor_total,
        CAST(m3.mobile_doctor_service AS UNSIGNED) AS mobile_doctor_service,
        CAST(m3.civil_take_care_total AS UNSIGNED) AS civil_take_care_total,
        CAST(m3.civil_take_care_service AS UNSIGNED) AS civil_take_care_service,
        CAST(m3.shert_team_prov_total AS UNSIGNED) AS shert_team_prov_total,
        CAST(m3.shert_team_prov_service AS UNSIGNED) AS shert_team_prov_service,
        CAST(m3.shert_team_dist_total AS UNSIGNED) AS shert_team_dist_total,
        CAST(m3.shert_team_dist_service AS UNSIGNED) AS shert_team_dist_service,
        CAST(m3.envo_cccu_total AS UNSIGNED) AS envo_cccu_total,
        CAST(m3.envo_cccu_service AS UNSIGNED) AS envo_cccu_service,
        CAST(m3.n95_mask_give_civil AS UNSIGNED) AS n95_mask_give_civil,
        CAST(m3.surgical_mask_give_civil AS UNSIGNED) AS surgical_mask_give_civil,
        CAST(m3.n95_mask_give_child AS UNSIGNED) AS n95_mask_give_child,
        CAST(m3.surgical_mask_give_child AS UNSIGNED) AS surgical_mask_give_child,
        CAST(m3.n95_mask_give_older AS UNSIGNED) AS n95_mask_give_older,
        CAST(m3.surgical_mask_give_older AS UNSIGNED) AS surgical_mask_give_older,
        CAST(m3.n95_mask_give_pregnant AS UNSIGNED) AS n95_mask_give_pregnant,
        CAST(m3.surgical_mask_give_pregnant AS UNSIGNED) AS surgical_mask_give_pregnant,
        CAST(m3.n95_mask_give_bedridden AS UNSIGNED) AS n95_mask_give_bedridden,
        CAST(m3.surgical_mask_give_bedridden AS UNSIGNED) AS surgical_mask_give_bedridden,
        CAST(m3.n95_mask_give_sick AS UNSIGNED) AS n95_mask_give_sick,
        CAST(m3.surgical_mask_give_sick AS UNSIGNED) AS surgical_mask_give_sick,
        CAST(m3.n95_mask_give_heart AS UNSIGNED) AS n95_mask_give_heart,
        CAST(m3.surgical_mask_give_heart AS UNSIGNED) AS surgical_mask_give_heart,
        CAST(m3.n95_mask_give_copd AS UNSIGNED) AS n95_mask_give_copd,
        CAST(m3.surgical_mask_give_copd AS UNSIGNED) AS surgical_mask_give_copd,
        CAST(m3.sky_doctor AS UNSIGNED) AS sky_doctor,
        CAST(m3.ambulance AS UNSIGNED) AS ambulance,
        CAST(m3.year AS UNSIGNED) AS year,
      FROM 
        measure3 m3
      JOIN 
        activity a ON m3.activity_id = a.activity_id
      JOIN 
        hospitals c ON a.hosp_code = c.hosp_code
      JOIN 
        provinces p ON c.prov_code = p.prov_code
      GROUP BY 
        p.provname
    `);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching Measure3 data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.createMeasure3 = async (req, res) => {
  const {
    activityId,
    pollutionClinicTotal,
    pollutionCliniService,
    onlinePollutionClinicTotal,
    onlinePollutionCliniService,
    mosquitoNetTotal,
    mosquitoNetService,
    nurseryDustFreeTotal,
    nurseryDustFreeService,
    publicHealthDustFreeTotal,
    publicHealthDustFreeService,
    officeDustFreeTotal,
    officeDustFreeService,
    buildingDustFreeTotal,
    buildingDustFreeService,
    otherDustFreeTotal,
    otherDustFreeService,
    team3DoctorTotal,
    team3DoctorService,
    mobileDoctorTotal,
    mobileDoctorService,
    civilTakeCareTotal,
    civilTakeCareService,
    shertTeamProvTotal,
    shertTeamProvService,
    shertTeamDistTotal,
    shertTeamDistService,
    envoCccuTotal,
    envoCccuService,
    n95MaskGiveCivil,
    surgicalMaskGiveCivil,
    n95MaskGiveChild,
    surgicalMaskGiveChild,
    n95MaskGiveOlder,
    surgicalMaskGiveOlder,
    n95MaskGivePregnant,
    surgicalMaskGivePregnant,
    n95MaskGiveBedridden,
    surgicalMaskGiveBedridden,
    n95MaskGiveSick,
    surgicalMaskGiveSick,
    n95MaskGiveHeart,
    surgicalMaskGiveHeart,
    n95MaskGiveCopd,
    surgicalMaskGiveCopd,
    skyDoctor,
    ambulance,
    year,
  } = req.body;

  if (
    !activityId ||
    pollutionClinicTotal === undefined ||
    pollutionCliniService === undefined ||
    onlinePollutionClinicTotal === undefined ||
    onlinePollutionCliniService === undefined ||
    mosquitoNetTotal === undefined ||
    mosquitoNetService === undefined ||
    nurseryDustFreeTotal === undefined ||
    nurseryDustFreeService === undefined ||
    publicHealthDustFreeTotal === undefined ||
    publicHealthDustFreeService === undefined ||
    officeDustFreeTotal === undefined ||
    officeDustFreeService === undefined ||
    buildingDustFreeTotal === undefined ||
    buildingDustFreeService === undefined ||
    otherDustFreeTotal === undefined ||
    otherDustFreeService === undefined ||
    team3DoctorTotal === undefined ||
    team3DoctorService === undefined ||
    mobileDoctorTotal === undefined ||
    mobileDoctorService === undefined ||
    civilTakeCareTotal === undefined ||
    civilTakeCareService === undefined ||
    shertTeamProvTotal === undefined ||
    shertTeamProvService === undefined ||
    shertTeamDistTotal === undefined ||
    shertTeamDistService === undefined ||
    envoCccuTotal === undefined ||
    envoCccuService === undefined ||
    n95MaskGiveCivil === undefined ||
    surgicalMaskGiveCivil === undefined ||
    n95MaskGiveChild === undefined ||
    surgicalMaskGiveChild === undefined ||
    n95MaskGiveOlder === undefined ||
    surgicalMaskGiveOlder === undefined ||
    n95MaskGivePregnant === undefined ||
    surgicalMaskGivePregnant === undefined ||
    n95MaskGiveBedridden === undefined ||
    surgicalMaskGiveBedridden === undefined ||
    n95MaskGiveSick === undefined ||
    surgicalMaskGiveSick === undefined ||
    n95MaskGiveHeart === undefined ||
    surgicalMaskGiveHeart === undefined ||
    n95MaskGiveCopd === undefined ||
    surgicalMaskGiveCopd === undefined ||
    skyDoctor === undefined ||
    ambulance === undefined ||
    !year
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO measure3 
        (
          activity_id, 
          pollution_clinic_total, 
          pollution_clini_service, 
          online_pollution_clinic_total, 
          online_pollution_clini_service,
          mosquito_net_total,
          mosquito_net_service,
          nursery_dust_free_total, 
          nursery_dust_free_service, 
          public_health_dust_free_total, 
          public_health_dust_free_service,
          office_dust_free_total, 
          office_dust_free_service, 
          building_dust_free_total, 
          building_dust_free_service,
          other_dust_free_total, 
          other_dust_free_service,
          team3_doctor_total, 
          team3_doctor_service, 
          mobile_doctor_total, 
          mobile_doctor_service,
          civil_take_care_total, 
          civil_take_care_service,
          shert_team_prov_total, 
          shert_team_prov_service,
          shert_team_dist_total, 
          shert_team_dist_service,
          envo_cccu_total, 
          envo_cccu_service,
          n95_mask_give_civil, 
          surgical_mask_give_civil,
          n95_mask_give_child, 
          surgical_mask_give_child,
          n95_mask_give_older, 
          surgical_mask_give_older,
          n95_mask_give_pregnant, 
          surgical_mask_give_pregnant,
          n95_mask_give_bedridden, 
          surgical_mask_give_bedridden,
          n95_mask_give_sick, 
          surgical_mask_give_sick,
          n95_mask_give_heart, 
          surgical_mask_give_heart,
          n95_mask_give_copd, 
          surgical_mask_give_copd,
          sky_doctor, 
          ambulance,
          year
        ) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        activityId,
        pollutionClinicTotal,
        pollutionCliniService,
        onlinePollutionClinicTotal,
        onlinePollutionCliniService,
        mosquitoNetTotal,
        mosquitoNetService,
        nurseryDustFreeTotal,
        nurseryDustFreeService,
        publicHealthDustFreeTotal,
        publicHealthDustFreeService,
        officeDustFreeTotal,
        officeDustFreeService,
        buildingDustFreeTotal,
        buildingDustFreeService,
        otherDustFreeTotal,
        otherDustFreeService,
        team3DoctorTotal,
        team3DoctorService,
        mobileDoctorTotal,
        mobileDoctorService,
        civilTakeCareTotal,
        civilTakeCareService,
        shertTeamProvTotal,
        shertTeamProvService,
        shertTeamDistTotal,
        shertTeamDistService,
        envoCccuTotal,
        envoCccuService,
        n95MaskGiveCivil,
        surgicalMaskGiveCivil,
        n95MaskGiveChild,
        surgicalMaskGiveChild,
        n95MaskGiveOlder,
        surgicalMaskGiveOlder,
        n95MaskGivePregnant,
        surgicalMaskGivePregnant,
        n95MaskGiveBedridden,
        surgicalMaskGiveBedridden,
        n95MaskGiveSick,
        surgicalMaskGiveSick,
        n95MaskGiveHeart,
        surgicalMaskGiveHeart,
        n95MaskGiveCopd,
        surgicalMaskGiveCopd,
        skyDoctor,
        ambulance,
        year,
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

exports.upsertMeasure3 = async (req, res) => {
  // ใช้ค่า default ให้กับ field ที่อาจจะไม่มีใน req.body
  const {
    activityId,
    pollutionClinicTotal,
    pollutionCliniService,
    onlinePollutionClinicTotal,
    onlinePollutionCliniService,
    mosquitoNetTotal, // กำหนด default เป็น 0
    mosquitoNetService, // กำหนด default เป็น 0
    nurseryDustFreeTotal,
    nurseryDustFreeService,
    publicHealthDustFreeTotal,
    publicHealthDustFreeService,
    officeDustFreeTotal,
    officeDustFreeService,
    buildingDustFreeTotal,
    buildingDustFreeService,
    otherDustFreeTotal,
    otherDustFreeService,
    team3DoctorTotal,
    team3DoctorService,
    mobileDoctorTotal,
    mobileDoctorService,
    civilTakeCareTotal,
    civilTakeCareService,
    shertTeamProvTotal,
    shertTeamProvService,
    shertTeamDistTotal,
    shertTeamDistService,
    envoCccuTotal,
    envoCccuService,
    n95MaskGiveCivil,
    surgicalMaskGiveCivil,
    n95MaskGiveChild,
    surgicalMaskGiveChild,
    n95MaskGiveOlder,
    surgicalMaskGiveOlder,
    n95MaskGivePregnant,
    surgicalMaskGivePregnant,
    n95MaskGiveBedridden,
    surgicalMaskGiveBedridden,
    n95MaskGiveSick,
    surgicalMaskGiveSick,
    n95MaskGiveHeart,
    surgicalMaskGiveHeart,
    n95MaskGiveCopd,
    surgicalMaskGiveCopd,
    skyDoctor,
    ambulance,
    year,
  } = req.body;

  // ตรวจสอบว่า field ที่จำเป็นครบถ้วนหรือไม่
  if (
    !activityId ||
    pollutionClinicTotal === undefined ||
    pollutionCliniService === undefined ||
    onlinePollutionClinicTotal === undefined ||
    onlinePollutionCliniService === undefined ||
    mosquitoNetTotal === undefined ||
    mosquitoNetService === undefined ||
    nurseryDustFreeTotal === undefined ||
    nurseryDustFreeService === undefined ||
    publicHealthDustFreeTotal === undefined ||
    publicHealthDustFreeService === undefined ||
    officeDustFreeTotal === undefined ||
    officeDustFreeService === undefined ||
    buildingDustFreeTotal === undefined ||
    buildingDustFreeService === undefined ||
    otherDustFreeTotal === undefined ||
    otherDustFreeService === undefined ||
    team3DoctorTotal === undefined ||
    team3DoctorService === undefined ||
    mobileDoctorTotal === undefined ||
    mobileDoctorService === undefined ||
    civilTakeCareTotal === undefined ||
    civilTakeCareService === undefined ||
    shertTeamProvTotal === undefined ||
    shertTeamProvService === undefined ||
    shertTeamDistTotal === undefined ||
    shertTeamDistService === undefined ||
    envoCccuTotal === undefined ||
    envoCccuService === undefined ||
    n95MaskGiveCivil === undefined ||
    surgicalMaskGiveCivil === undefined ||
    n95MaskGiveChild === undefined ||
    surgicalMaskGiveChild === undefined ||
    n95MaskGiveOlder === undefined ||
    surgicalMaskGiveOlder === undefined ||
    n95MaskGivePregnant === undefined ||
    surgicalMaskGivePregnant === undefined ||
    n95MaskGiveBedridden === undefined ||
    surgicalMaskGiveBedridden === undefined ||
    n95MaskGiveSick === undefined ||
    surgicalMaskGiveSick === undefined ||
    n95MaskGiveHeart === undefined ||
    surgicalMaskGiveHeart === undefined ||
    n95MaskGiveCopd === undefined ||
    surgicalMaskGiveCopd === undefined ||
    skyDoctor === undefined ||
    ambulance === undefined ||
    !year
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO measure3 
        (
          activity_id, 
          pollution_clinic_total, 
          pollution_clini_service, 
          online_pollution_clinic_total, 
          online_pollution_clini_service,
          mosquito_net_total, 
          mosquito_net_service, 
          nursery_dust_free_total, 
          nursery_dust_free_service, 
          public_health_dust_free_total, 
          public_health_dust_free_service,
          office_dust_free_total, 
          office_dust_free_service, 
          building_dust_free_total, 
          building_dust_free_service,
          other_dust_free_total, 
          other_dust_free_service,
          team3_doctor_total, 
          team3_doctor_service, 
          mobile_doctor_total, 
          mobile_doctor_service,
          civil_take_care_total, 
          civil_take_care_service,
          shert_team_prov_total, 
          shert_team_prov_service,
          shert_team_dist_total, 
          shert_team_dist_service,
          envo_cccu_total, 
          envo_cccu_service,
          n95_mask_give_civil, 
          surgical_mask_give_civil,
          n95_mask_give_child, 
          surgical_mask_give_child,
          n95_mask_give_older, 
          surgical_mask_give_older,
          n95_mask_give_pregnant, 
          surgical_mask_give_pregnant,
          n95_mask_give_bedridden, 
          surgical_mask_give_bedridden,
          n95_mask_give_sick, 
          surgical_mask_give_sick,
          n95_mask_give_heart, 
          surgical_mask_give_heart,
          n95_mask_give_copd, 
          surgical_mask_give_copd,
          sky_doctor, 
          ambulance,
          year
        )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? , ?)
      ON DUPLICATE KEY UPDATE
        pollution_clinic_total = VALUES(pollution_clinic_total),
        pollution_clini_service = VALUES(pollution_clini_service),
        online_pollution_clinic_total = VALUES(online_pollution_clinic_total),
        online_pollution_clini_service = VALUES(online_pollution_clini_service),
        mosquito_net_total = VALUES(mosquito_net_total),
        mosquito_net_service = VALUES(mosquito_net_service),
        nursery_dust_free_total = VALUES(nursery_dust_free_total),
        nursery_dust_free_service = VALUES(nursery_dust_free_service),
        public_health_dust_free_total = VALUES(public_health_dust_free_total),
        public_health_dust_free_service = VALUES(public_health_dust_free_service),
        office_dust_free_total = VALUES(office_dust_free_total),
        office_dust_free_service = VALUES(office_dust_free_service),
        building_dust_free_total = VALUES(building_dust_free_total),
        building_dust_free_service = VALUES(building_dust_free_service),
        other_dust_free_total = VALUES(other_dust_free_total),
        other_dust_free_service = VALUES(other_dust_free_service),
        team3_doctor_total = VALUES(team3_doctor_total),
        team3_doctor_service = VALUES(team3_doctor_service),
        mobile_doctor_total = VALUES(mobile_doctor_total),
        mobile_doctor_service = VALUES(mobile_doctor_service),
        civil_take_care_total = VALUES(civil_take_care_total),
        civil_take_care_service = VALUES(civil_take_care_service),
        shert_team_prov_total = VALUES(shert_team_prov_total),
        shert_team_prov_service = VALUES(shert_team_prov_service),
        shert_team_dist_total = VALUES(shert_team_dist_total),
        shert_team_dist_service = VALUES(shert_team_dist_service),
        envo_cccu_total = VALUES(envo_cccu_total),
        envo_cccu_service = VALUES(envo_cccu_service),
        n95_mask_give_civil = VALUES(n95_mask_give_civil),
        surgical_mask_give_civil = VALUES(surgical_mask_give_civil),
        n95_mask_give_child = VALUES(n95_mask_give_child),
        surgical_mask_give_child = VALUES(surgical_mask_give_child),
        n95_mask_give_older = VALUES(n95_mask_give_older),
        surgical_mask_give_older = VALUES(surgical_mask_give_older),
        n95_mask_give_pregnant = VALUES(n95_mask_give_pregnant),
        surgical_mask_give_pregnant = VALUES(surgical_mask_give_pregnant),
        n95_mask_give_bedridden = VALUES(n95_mask_give_bedridden),
        surgical_mask_give_bedridden = VALUES(surgical_mask_give_bedridden),
        n95_mask_give_sick = VALUES(n95_mask_give_sick),
        surgical_mask_give_sick = VALUES(surgical_mask_give_sick),
        n95_mask_give_heart = VALUES(n95_mask_give_heart),
        surgical_mask_give_heart = VALUES(surgical_mask_give_heart),
        n95_mask_give_copd = VALUES(n95_mask_give_copd),
        surgical_mask_give_copd = VALUES(surgical_mask_give_copd),
        sky_doctor = VALUES(sky_doctor),
        ambulance = VALUES(ambulance)
      `,
      [
        activityId,
        pollutionClinicTotal,
        pollutionCliniService,
        onlinePollutionClinicTotal,
        onlinePollutionCliniService,
        mosquitoNetTotal,
        mosquitoNetService,
        nurseryDustFreeTotal,
        nurseryDustFreeService,
        publicHealthDustFreeTotal,
        publicHealthDustFreeService,
        officeDustFreeTotal,
        officeDustFreeService,
        buildingDustFreeTotal,
        buildingDustFreeService,
        otherDustFreeTotal,
        otherDustFreeService,
        team3DoctorTotal,
        team3DoctorService,
        mobileDoctorTotal,
        mobileDoctorService,
        civilTakeCareTotal,
        civilTakeCareService,
        shertTeamProvTotal,
        shertTeamProvService,
        shertTeamDistTotal,
        shertTeamDistService,
        envoCccuTotal,
        envoCccuService,
        n95MaskGiveCivil,
        surgicalMaskGiveCivil,
        n95MaskGiveChild,
        surgicalMaskGiveChild,
        n95MaskGiveOlder,
        surgicalMaskGiveOlder,
        n95MaskGivePregnant,
        surgicalMaskGivePregnant,
        n95MaskGiveBedridden,
        surgicalMaskGiveBedridden,
        n95MaskGiveSick,
        surgicalMaskGiveSick,
        n95MaskGiveHeart,
        surgicalMaskGiveHeart,
        n95MaskGiveCopd,
        surgicalMaskGiveCopd,
        skyDoctor,
        ambulance,
        year,
      ]
    );
    res.status(200).json({
      message: "Measure3 data upserted successfully",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error upserting Measure3 data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
