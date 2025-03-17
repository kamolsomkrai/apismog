// models/dashboardModel.js
const pool = require("../config/dbrabad");

const getDiseaseByHospital = async ({
  province,
  start_date,
  end_date,
  search,
}) => {
  let sql =
    "SELECT sdh.groupname AS disease_name, DATE_FORMAT(sdh.service_date, '%Y-%m-%d') AS service_date, sdh.province, sdh.hospital_name, sdh.patient_count FROM summary_disease_hospital sdh";
  let conditions = [];
  let params = [];

  if (province) {
    conditions.push("province = ?");
    params.push(province);
  }

  if (start_date && end_date) {
    conditions.push("service_date BETWEEN ? AND ?");
    params.push(start_date, end_date);
  } else if (start_date) {
    conditions.push("service_date >= ?");
    params.push(start_date);
  } else if (end_date) {
    conditions.push("service_date <= ?");
    params.push(end_date);
  }

  if (search) {
    conditions.push("groupname LIKE ?");
    params.push(`%${search}%`);
  }

  if (conditions.length > 0) {
    sql += " WHERE " + conditions.join(" AND ");
  }

  try {
    const [rows] = await pool.query(sql, params);
    return rows;
  } catch (error) {
    console.error("Error executing query:", error);
    throw error;
  }
};

const getPm25 = async ({ province, start_date, end_date, search }) => {
  let sql =
    "SELECT pm.*,d.distcode FROM pm25_dang pm JOIN district_th d ON pm.amphur = d.dist_name_TH ";
  let conditions = [];
  let params = [];

  if (province) {
    conditions.push("province = ?");
    params.push(province);
  }

  if (start_date && end_date) {
    conditions.push("collect_date BETWEEN ? AND ?");
    params.push(start_date, end_date);
  } else if (start_date) {
    conditions.push("collect_date >= ?");
    params.push(start_date);
  } else if (end_date) {
    conditions.push("collect_date <= ?");
    params.push(end_date);
  }

  if (search) {
    conditions.push("event_valid = ?");
    params.push(`%${search}%`);
  }

  if (conditions.length > 0) {
    sql += " WHERE " + conditions.join(" AND ");
  }

  try {
    const [rows] = await pool.query(sql, params);
    return rows;
  } catch (error) {
    console.error("Error executing query:", error);
    throw error;
  }
};

const getActivityList = async () => {
  const sql = `
    SELECT 
        m1.activity_id,
        m1.activity_catalog,
        ag.des AS catalogname,
        m1.activity_detail,
        a.hosp_code,
        hos.hospname,
        a.prov_code,
        p.provname,
        a.dist_code,
        m1.updated_at,
        (
            SELECT 
                JSON_ARRAYAGG(
                    JSON_OBJECT('file_path', m1u.file_path)
                )
            FROM 
                measure1_upload m1u
            WHERE 
                m1u.measure1_id = m1.measure1_id
        ) AS uploads
    FROM 
        measure1 m1
    JOIN 
        activity a ON m1.activity_id = a.activity_id
    JOIN 
        hospitals hos ON hos.hospcode = a.hosp_code
    JOIN 
        provinces p ON p.provcode = a.prov_code
    JOIN
        activity_group ag ON ag.id = m1.activity_catalog;
  `;

  try {
    const [rows] = await pool.query(sql);
    return rows;
  } catch (error) {
    console.error("Error executing query:", error);
    throw error;
  }
};

module.exports = { getDiseaseByHospital, getPm25, getActivityList };
