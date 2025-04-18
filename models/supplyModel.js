// models/supplyModel.js
const pool = require("../config/db2");

const getSupplies = async (hospcode, limit, offset, search) => {
  let sql = "SELECT * FROM supplies WHERE hospcode = ?";
  let params = [hospcode];

  if (search) {
    sql += " AND name LIKE ?";
    params.push(`%${search}%`);
  }

  sql += " LIMIT ? OFFSET ?";
  params.push(limit, offset);

  const [rows] = await pool.query(sql, params);
  return rows;
};

const getSupplyById = async (id, hospcode) => {
  const [rows] = await pool.query(
    "SELECT * FROM supplies WHERE id = ? AND hospcode = ?",
    [id, hospcode]
  );
  return rows[0];
};

const createSupply = async (
  hospital_id,
  provcode,
  supply_id,
  quantity_stock,
  quantity_add,
  quantity_minus,
  quantity_total
) => {
  // ตรวจสอบว่า hospital_id ถูกส่งเข้ามา
  if (!hospital_id) {
    throw new Error("hospital_id is required");
  }
  const [result] = await pool.query(
    "INSERT INTO supplies (hospcode, provcode, supplie_id, quantity_stock, quantity_add, quantity_minus, quantity_total) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      hospital_id, // ใช้ hospital_id จาก req.body เป็นค่า hospcode
      provcode,
      supply_id,
      quantity_stock,
      quantity_add,
      quantity_minus,
      quantity_total,
    ]
  );
  return result.insertId;
};

const updateSupply = async (
  id,
  hospcode,
  name,
  description,
  quantity,
  unit
) => {
  await pool.query(
    "UPDATE supplies SET quantity_stock = ?, quantity_add = ?, quantity_minus = ?, quantity_total = ? WHERE id = ? AND hospcode = ?",
    [quantity_stock, quantity_add, quantity_minus, quantity_total, id, hospcode]
  );
};

const deleteSupply = async (id) => {
  await pool.query("DELETE FROM supplies WHERE id = ?", [id]);
};

const countSupplies = async (hospcode, search) => {
  let sql = "SELECT COUNT(*) as count FROM supplies WHERE hospcode = ?";
  let params = [hospcode];

  if (search) {
    sql += " AND name LIKE ?";
    params.push(`%${search}%`);
  }

  const [rows] = await pool.query(sql, params);
  return rows[0].count;
};

const getSupplyData = async (hospcode, supply_id) => {
  // ดึงข้อมูลและ return ผลลัพธ์กลับไป
  const [rows] = await pool.query(
    "SELECT s.quantity_stock FROM supplies s WHERE s.hospcode = ? AND s.supplie_id = ? ORDER BY created_at DESC LIMIT 1",
    [hospcode, supply_id]
  );
  return rows;
};

const getSupplyByHos = async (hospcode, provcode, ssj_ok) => {
  // กำหนดเงื่อนไขสำหรับการกรองข้อมูล: ค่าเริ่มต้นใช้ provcode
  let field = "provcode";
  let fieldValue = provcode;
  // ถ้า ssj_ok.data[0] เท่ากับ 0 ให้ใช้ hospcode ในการกรอง
  if (ssj_ok?.data[0] === 0) {
    field = "hospcode";
    fieldValue = hospcode;
  }

  // สร้าง SQL query แบบไดนามิกโดยใช้เงื่อนไขที่กำหนด
  const query = `
    SELECT
      s.id,
      s.hospcode,
      h.hospname,
      s.supplie_id,
      sc.suppliename,
      sc.supplietype,
      sc.suppliecatalog,
      s.quantity_stock,
      s.provcode,
      p.provname,
      s.updated_at 
    FROM supplies s
    JOIN (
      SELECT hospcode, provcode, supplie_id, MAX(created_at) AS latest_created_at 
      FROM supplies sa 
      WHERE sa.${field} = ?
      GROUP BY hospcode, provcode, supplie_id 
    ) latest ON s.hospcode = latest.hospcode 
      AND s.provcode = latest.provcode 
      AND s.supplie_id = latest.supplie_id 
      AND s.created_at = latest.latest_created_at
    JOIN hospitals h ON s.hospcode = h.hospcode
    JOIN supplies_catalog sc ON s.supplie_id = sc.supplie_id
    JOIN provinces p ON s.provcode = p.provcode 
    WHERE s.${field} = ?
  `;
  const params = [fieldValue, fieldValue];

  const [rows] = await pool.query(query, params);
  return rows;
};

module.exports = {
  getSupplies,
  getSupplyById,
  createSupply,
  updateSupply,
  deleteSupply,
  countSupplies,
  getSupplyData,
  getSupplyByHos,
};
