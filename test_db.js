const pool = require('./config/db');
require('dotenv').config(); // Need dotenv if running independently

async function test() {
    try {
        const [rows] = await pool.query('SELECT province, amphur, collect_date, pm25_max FROM pm25_dang LIMIT 5');
        console.log(rows);
    } catch(e) {
        console.error(e);
    }
    process.exit();
}
test();
