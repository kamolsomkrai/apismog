// controllers/dashboardController.js
const { validationResult } = require("express-validator");
const {
  getDiseaseByHospital,
  getPm25,
  getActivityList,
  getCluster,
} = require("../models/dashboardModel");

const getDiseaseByHospitalController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // รับพารามิเตอร์จาก req.query
  const { province, start_date, end_date, search } = req.body;

  try {
    const supplyList = await getDiseaseByHospital({
      province,
      start_date,
      end_date,
      search,
    });
    res.json(supplyList);
  } catch (error) {
    console.error("Error fetching disease:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const getPm25Controller = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // รับพารามิเตอร์จาก req.query
  const { province, start_date, end_date, search } = req.body;

  try {
    const supplyList = await getPm25({
      province,
      start_date,
      end_date,
      search,
    });
    res.json(supplyList);
  } catch (error) {
    console.error("Error fetching pm2.5:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const getActivityListController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // รับพารามิเตอร์จาก req.query
  // const { province, start_date, end_date, search } = req.body;

  try {
    const supplyList = await getActivityList();
    res.json(supplyList);
  } catch (error) {
    console.error("Error fetching activity list:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const getClusterController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // รับพารามิเตอร์จาก req.query
  // const { province, start_date, end_date, search } = req.body;

  try {
    const supplyList = await getCluster();
    res.json(supplyList);
  } catch (error) {
    console.error("Error fetching cluster:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
  getDiseaseByHospitalController,
  getPm25Controller,
  getActivityListController,
  getClusterController,
};
