// config/db.js
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST2 || "localhost",
  user: process.env.DB_USER2,
  password: process.env.DB_PASSWORD2,
  database: process.env.DB_NAME2,
  port: process.env.DB_PORT2 || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
});

module.exports = pool;
