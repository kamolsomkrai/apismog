// models/frontendModel.js
const pool = require("../config/db2");

const getSuppliesList = async (search) => {
  let sql = "SELECT * FROM supplies_catalog ";
  let params = [];
  if (search) {
    sql += "WHERE supplyname LIKE ?";
    params.push(`%${search}%`);
  }
  const [rows] = await pool.query(sql, params);
  return rows;
};

const getSummary = async () => {
  let sql =
    "SELECT sc.suppliename AS supplyname, provcode, SUM(s.quantity_total) AS total_quantity FROM supplies s JOIN supplies_catalog sc ON s.supplie_id = sc.supplie_id GROUP BY name, provcode";
  const [rows] = await pool.query(sql);
  return rows;
};

module.exports = {
  getSuppliesList,
  getSummary,
};
