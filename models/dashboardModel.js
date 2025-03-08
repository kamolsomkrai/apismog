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
  let sql = "SELECT * FROM pm25_dang ";
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

module.exports = { getDiseaseByHospital, getPm25 };
