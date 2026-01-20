// models/userModel.js
const pool = require("../config/db");

const createUser = async (username, hashedPassword, hospcode, hospname, provcode, provname) => {
  const [result] = await pool.query(
    "INSERT INTO users (username, password_hash, hosp_code, name, province_code, province_name) VALUES (?, ?, ?, ?, ?, ?)",
    [username, hashedPassword, hospcode, hospname, provcode, provname]
  );
  return result.insertId;
};

const findHospitalByCode = async (hospcode) => {
  const [rows] = await pool.query(
    `SELECT 
      c.hoscode, 
      c.hosname, 
      c.provcode, 
      c.distcode,
      p.provname
    FROM chospital c
    LEFT JOIN provinces p ON c.provcode = p.provcode
    WHERE c.hoscode = ?`,
    [hospcode]
  );
  return rows[0];
};

const findUserByUsername = async (username) => {
  const [rows] = await pool.query(
    `SELECT 
      users.id,
      users.username,
      users.password_hash AS password,
      users.hosp_code AS hospcode,
      users.name AS hospname,
      users.province_code AS provcode,
      CONCAT(c.provcode, c.distcode) AS distcode,
      users.role AS ssj_ok
    FROM users 
    LEFT JOIN chospital c ON users.hosp_code = c.hoscode 
    WHERE username = ?`,
    [username]
  );
  return rows[0];
};

const updateUserRefreshToken = async (userId, refreshToken) => {
  await pool.query("UPDATE users SET refresh_token = ? WHERE id = ?", [
    refreshToken,
    userId,
  ]);
};

module.exports = {
  createUser,
  findUserByUsername,
  updateUserRefreshToken,
  findHospitalByCode,
};
