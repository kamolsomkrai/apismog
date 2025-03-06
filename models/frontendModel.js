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
  try {
    // สร้าง SQL query
    const sql = `
      SELECT
        s.id,
        s.provcode,
        p.provname,
        s.hospcode,
        h.hospname,
        s.supplie_id,
        sc.suppliename,
        s.quantity_stock,
        sc.supplietype,
        sc.suppliecatalog,
        s.updated_at
      FROM supplies s
      JOIN (
        SELECT 
          hospcode, 
          provcode, 
          supplie_id, 
          MAX(created_at) AS latest_created_at 
        FROM supplies 
        GROUP BY hospcode, provcode, supplie_id
      ) latest ON s.hospcode = latest.hospcode 
        AND s.provcode = latest.provcode 
        AND s.supplie_id = latest.supplie_id 
        AND s.created_at = latest.latest_created_at
      JOIN hospitals h ON s.hospcode = h.hospcode
      JOIN supplies_catalog sc ON s.supplie_id = sc.supplie_id
      JOIN provinces p ON s.provcode = p.provcode
    `;

    // ดำเนินการ query ข้อมูล
    const [rows] = await pool.query(sql);
    return rows;
  } catch (error) {
    console.error("Error fetching summary data:", error);
    throw error; // ส่ง error ไปให้ caller จัดการต่อ
  }
};

module.exports = {
  getSuppliesList,
  getSummary,
};
