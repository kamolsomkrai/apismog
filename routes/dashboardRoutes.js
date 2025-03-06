// routes/dashboardRoutes.js
const express = require("express");
const { check } = require("express-validator");
const {
  getDiseaseByHospitalController,
} = require("../controllers/dashboardController");
const router = express.Router();

router.get(
  "/diseasebyhospital",
  [
    check("province").optional().trim().escape(),
    check("startDate").optional().isISO8601(),
    check("endDate").optional().isISO8601(),
    check("search").optional().trim().escape(),
  ],
  getDiseaseByHospitalController
);

module.exports = router;
