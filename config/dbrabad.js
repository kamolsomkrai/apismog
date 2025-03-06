// config/db.js
const mysql = require("mysql2/promise");

const poolsmog = mysql.createPool({
  host: process.env.DBRABAD_HOST || "localhost",
  user: process.env.DBRABAD_USER,
  password: process.env.DBRABAD_PASSWORD,
  database: process.env.DBRABAD_NAME,
  port: process.env.DBRABAD_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
});

module.exports = poolsmog;
