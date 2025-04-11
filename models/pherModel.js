const pool = require("../config/dbrabad");

const getPher = async (start_date, end_date) => {
  const conn = await pool.getConnection();
  const query = `SELECT guid,accident_date, accident_time, hospital_name, hospital_number AS hn, 
                CONCAT(patient_prefix, patient_first_name, " ", patient_last_name) AS patient_name,
                patient_sex, patient_age,death_date
                FROM pher_rti
                WHERE is_deleted = 0 
                AND accident_date BETWEEN ? AND ? 
                AND death_date IS NOT NULL`;
  const [rows] = await conn.query(query, [start_date, end_date]);
  conn.release();
  return rows;
};

const updatePher = async (guid, hospname) => {
  const conn = await pool.getConnection();
  const query = `UPDATE pher SET deleted_by = ?, is_deleted = 1 WHERE guid = ?`;
  const [result] = await conn.query(query, [hospname, guid]);
  conn.release();
  return result.affectedRows > 0;
};

const getInjuryRti = async (start_date, end_date) => {
  const conn = await pool.getConnection();
  const query = `WITH current_year_RTI_data AS (
    SELECT
        accident_date,
        hospital_province,
        COUNT(*) AS injury_case,
        COUNT(death_date) AS dead_case
    FROM pher_rti
    WHERE 
        is_deleted = 0 
        AND accident_date BETWEEN ? AND ?
    GROUP BY hospital_province, accident_date
),
previous_year_data AS (
    SELECT
        DATE_ADD(accident_date, INTERVAL 1 YEAR) AS accident_date,
        hospital_province,
        COUNT(*) AS prev_injury_case,
        COUNT(death_date) AS prev_dead_case
    FROM pher_rti
    WHERE 
        is_deleted = 0 
        AND accident_date BETWEEN DATE_SUB(?, INTERVAL 1 YEAR) 
                              AND DATE_SUB(?, INTERVAL 1 YEAR)
    GROUP BY hospital_province, accident_date
),
combined_data AS (
    SELECT
        c.accident_date,
        c.hospital_province,
        c.injury_case,
        c.dead_case,
        p.prev_injury_case,
        p.prev_dead_case,
        SUM(c.injury_case) OVER (PARTITION BY c.hospital_province ORDER BY c.accident_date) AS cumulative_injury_2025,
        SUM(c.dead_case) OVER (PARTITION BY c.hospital_province ORDER BY c.accident_date) AS cumulative_dead_2025,
        SUM(p.prev_injury_case) OVER (PARTITION BY c.hospital_province ORDER BY c.accident_date) AS cumulative_injury_2024,
        SUM(p.prev_dead_case) OVER (PARTITION BY c.hospital_province ORDER BY c.accident_date) AS cumulative_dead_2024
    FROM current_year_RTI_data c
    LEFT JOIN previous_year_data p 
        ON c.accident_date = p.accident_date 
        AND c.hospital_province = p.hospital_province
)
SELECT
    accident_date,
    hospital_province,
    injury_case,
    dead_case,
    prev_injury_case,
    prev_dead_case,
    CASE 
        WHEN prev_injury_case = 0 THEN 0.00
        ELSE ROUND(((injury_case - prev_injury_case) / prev_injury_case) * 100, 2)
    END AS injury_pct_diff,
    CASE 
        WHEN prev_dead_case = 0 THEN 0.00
        ELSE ROUND(((dead_case - prev_dead_case) / prev_dead_case) * 100, 2)
    END AS dead_pct_diff,
    cumulative_injury_2025,
    cumulative_dead_2025,
    cumulative_injury_2024,
    cumulative_dead_2024
FROM combined_data
ORDER BY hospital_province, accident_date`;
  const [rows] = await conn.query(query, [
    start_date,
    end_date,
    start_date,
    end_date,
  ]);
  conn.release();
  return rows;
};

const getInjuryTotal = async (start_date, end_date) => {
  const conn = await pool.getConnection();
  const query = `WITH current_year_RTI_data AS (
    SELECT
        accident_date,
        COUNT(*) AS injury_case,
        COUNT(death_date) AS dead_case
    FROM pher_rti
    WHERE 
        is_deleted = 0 
        AND accident_date BETWEEN ? AND ?
    GROUP BY accident_date
),
previous_year_data AS (
    SELECT
        DATE_ADD(accident_date, INTERVAL 1 YEAR) AS accident_date,
        COUNT(*) AS prev_injury_case,
        COUNT(death_date) AS prev_dead_case
    FROM pher_rti
    WHERE 
        is_deleted = 0 
        AND accident_date BETWEEN DATE_SUB(?, INTERVAL 1 YEAR) 
                              AND DATE_SUB(?, INTERVAL 1 YEAR)
    GROUP BY accident_date
),
combined_data AS (
    SELECT
        c.accident_date,
        c.injury_case,
        c.dead_case,
        p.prev_injury_case,
        p.prev_dead_case,
        SUM(c.injury_case) OVER (ORDER BY c.accident_date) AS cumulative_injury_2025,
        SUM(c.dead_case) OVER (ORDER BY c.accident_date) AS cumulative_dead_2025,
        SUM(p.prev_injury_case) OVER (ORDER BY c.accident_date) AS cumulative_injury_2024,
        SUM(p.prev_dead_case) OVER (ORDER BY c.accident_date) AS cumulative_dead_2024
    FROM current_year_RTI_data c
    LEFT JOIN previous_year_data p 
        ON c.accident_date = p.accident_date
)
SELECT
    accident_date,
    injury_case,
    dead_case,
    prev_injury_case,
    prev_dead_case,
    CASE 
        WHEN prev_injury_case = 0 THEN 0.00
        ELSE ROUND(((injury_case - prev_injury_case) / prev_injury_case) * 100, 2)
    END AS injury_pct_diff,
    CASE 
        WHEN prev_dead_case = 0 THEN 0.00
        ELSE ROUND(((dead_case - prev_dead_case) / prev_dead_case) * 100, 2)
    END AS dead_pct_diff,
    cumulative_injury_2025,
    cumulative_dead_2025,
    cumulative_injury_2024,
    cumulative_dead_2024
FROM combined_data
ORDER BY accident_date`;
  const [rows] = await conn.query(query, [
    start_date,
    end_date,
    start_date,
    end_date,
  ]);
  conn.release();
  return rows;
};

const getRiskVehicle = async (start_date, end_date) => {
  const conn = await pool.getConnection();
  const query = `WITH vehicle_data AS (
    SELECT primary_vehicle_type AS vehicle_type
    FROM pher_rti
    WHERE is_deleted = 0
    AND accident_date BETWEEN ? AND ?
    AND primary_vehicle_type IS NOT NULL
    
    UNION ALL
    
    SELECT secondary_vehicle_type AS vehicle_type
    FROM pher_rti
    WHERE is_deleted = 0
    AND accident_date BETWEEN ? AND ?
    AND secondary_vehicle_type IS NOT NULL
),
total_count AS (
    SELECT COUNT(*) AS total FROM vehicle_data
)
SELECT 
    v.vehicle_type,
    COUNT(*) AS vehicle_count,
    ROUND(COUNT(*) * 100.0 / t.total, 2) AS percentage
FROM 
    vehicle_data v,
    total_count t
GROUP BY 
    v.vehicle_type, t.total
ORDER BY 
    vehicle_count DESC`;
  const [rows] = await conn.query(query, [
    start_date,
    end_date,
    start_date,
    end_date,
  ]);
  conn.release();
  return rows;
};

const getRiskRti = async (start_date, end_date) => {
  const conn = await pool.getConnection();
  const query = `SELECT 
    SUM(CASE WHEN (primary_vehicle_safety = 'HELMET' OR secondary_vehicle_safety = 'HELMET') 
             AND risk_factor_4 = 0 THEN 1 ELSE 0 END) AS no_helmet_count,
    SUM(CASE WHEN (primary_vehicle_safety = 'HELMET' OR secondary_vehicle_safety = 'HELMET') 
             AND risk_factor_4 = 1 THEN 1 ELSE 0 END) AS helmet_count,
    ROUND(SUM(CASE WHEN (primary_vehicle_safety = 'HELMET' OR secondary_vehicle_safety = 'HELMET') 
                   AND risk_factor_4 = 0 THEN 1 ELSE 0 END) * 100.0 / 
        NULLIF(SUM(CASE WHEN (primary_vehicle_safety = 'HELMET' OR secondary_vehicle_safety = 'HELMET') THEN 1 ELSE 0 END), 0), 2) 
        AS no_helmet_percentage,
    SUM(CASE WHEN (primary_vehicle_safety = 'BELT' OR secondary_vehicle_safety = 'BELT') 
             AND risk_factor_3 = 0 THEN 1 ELSE 0 END) AS no_belt_count,
    SUM(CASE WHEN (primary_vehicle_safety = 'BELT' OR secondary_vehicle_safety = 'BELT') 
             AND risk_factor_3 = 1 THEN 1 ELSE 0 END) AS belt_count,
    ROUND(SUM(CASE WHEN (primary_vehicle_safety = 'BELT' OR secondary_vehicle_safety = 'BELT') 
                   AND risk_factor_3 = 0 THEN 1 ELSE 0 END) * 100.0 / 
        NULLIF(SUM(CASE WHEN (primary_vehicle_safety = 'BELT' OR secondary_vehicle_safety = 'BELT') THEN 1 ELSE 0 END), 0), 2) 
        AS no_belt_percentage,
    SUM(CASE WHEN risk_factor_1 = 1 THEN 1 ELSE 0 END) AS alcohol_use_count,
    ROUND(SUM(CASE WHEN risk_factor_1 = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) 
        AS alcohol_use_percentage,
    SUM(CASE WHEN risk_factor_2 = 1 THEN 1 ELSE 0 END) AS drug_use_count,
    ROUND(SUM(CASE WHEN risk_factor_2 = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) 
        AS drug_use_percentage,
    SUM(CASE WHEN risk_factor_5 = 1 THEN 1 ELSE 0 END) AS phone_use_count,
    ROUND(SUM(CASE WHEN risk_factor_5 = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) 
        AS phone_use_percentage,
    COUNT(*) AS total_cases
FROM 
    pher_rti
WHERE 
    is_deleted = 0
    AND accident_date BETWEEN ? AND ?`;
  const [rows] = await conn.query(query, [start_date, end_date]);
  conn.release();
  return rows;
};

const getRiskRoad = async (start_date, end_date) => {
  const conn = await pool.getConnection();
  const query = `WITH filtered_accidents AS (
    SELECT COUNT(*) AS filtered_total
    FROM pher_rti
    WHERE is_deleted = 0
    AND accident_date BETWEEN ? AND ?
    AND accident_location_detail IN (
        'ถนนหรือทางหลวง',
        'ถนนใน อบต./หมู่บ้าน',
        'ถนนกรมทางหลวงชนบท',
        'ถนนในเมือง(เทศบาล)'
    )
)
SELECT
    p.accident_location_detail,
    COUNT(*) AS count_accident,
    ROUND(COUNT(*) * 100.0 / f.filtered_total, 2) AS percentage
FROM
    pher_rti p,
    filtered_accidents f
WHERE
    p.is_deleted = 0
    AND p.accident_date BETWEEN ? AND ?
    AND p.accident_location_detail IN (
        'ถนนหรือทางหลวง',
        'ถนนใน อบต./หมู่บ้าน',
        'ถนนกรมทางหลวงชนบท',
        'ถนนในเมือง(เทศบาล)'
    )
GROUP BY
    p.accident_location_detail, f.filtered_total
ORDER BY
    count_accident DESC`;
  const [rows] = await conn.query(query, [
    start_date,
    end_date,
    start_date,
    end_date,
  ]);
  conn.release();
  return rows;
};

module.exports = {
  getPher,
  updatePher,
  getInjuryRti,
  getInjuryTotal,
  getRiskVehicle,
  getRiskRti,
  getRiskRoad,
};
