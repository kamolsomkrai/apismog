// controllers/dashboardController.js
const { validationResult } = require("express-validator");
const { getDiseaseByHospital } = require("../models/dashboardModel");

const getDiseaseByHospitalController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // รับพารามิเตอร์จาก req.query
  const { province, startDate, endDate, search } = req.query;

  try {
    const supplyList = await getDiseaseByHospital({
      province,
      startDate,
      endDate,
      search,
    });
    res.json(supplyList);
  } catch (error) {
    console.error("Error fetching supply list:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = { getDiseaseByHospitalController };
