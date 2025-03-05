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
  const [result] = await pool.query(
    "INSERT INTO supplies (hospcode, provcode, supplie_id, quantity_stock, quantity_add, quantity_minus, quantity_total) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      hospital_id,
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

const deleteSupply = async (id, hospcode) => {
  await pool.query("DELETE FROM supplies WHERE id = ? AND hospcode = ?", [
    id,
    hospcode,
  ]);
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

module.exports = {
  getSupplies,
  getSupplyById,
  createSupply,
  updateSupply,
  deleteSupply,
  countSupplies,
  getSupplyData,
};
