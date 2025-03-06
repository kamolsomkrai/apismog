// routes/dashboardRoutes.js
const express = require("express");
const { check } = require("express-validator");
const {
  getDiseaseByHospitalController,
} = require("../controllers/dashboardController");
const router = express.Router();

router.post(
  "/diseasebyhospital",
  [
    check("province").optional().trim().escape(),
    check("start_date").optional().isISO8601(),
    check("end_date").optional().isISO8601(),
    check("search").optional().trim().escape(),
  ],
  getDiseaseByHospitalController
);

module.exports = router;
