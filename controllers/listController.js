const pool = require("../config/db1");

exports.getHospitalList = async (req, res) => {
  const { provcode, ssj_ok } = req.user;
  try {
    let query = `
      SELECT ch.hoscode AS hospcode, ch.hosname AS hospname 
      FROM chospital ch 
      JOIN users u ON ch.hoscode = u.hospcode
    `;
    let params = [];

    if (ssj_ok === 1) {
      query += " WHERE u.provcode = ? AND u.ssj_ok = 0 ";
      params.push(provcode);
    } else if (ssj_ok === 0) {
      query += " WHERE u.provcode = ? ";
      params.push(provcode);
    }

    query += " GROUP BY u.hospcode ";

    const [rows] = await pool.query(query, params);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching Measure1 data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
