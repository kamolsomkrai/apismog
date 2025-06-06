// routes/dashboardRoutes.js
const express = require("express");
const { check } = require("express-validator");
const {
  getDiseaseByHospitalController,
  getPm25Controller,
  getActivityListController,
  getClusterController,
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

router.post(
  "/pm25",
  [
    check("province").optional().trim().escape(),
    check("start_date").optional().isISO8601(),
    check("end_date").optional().isISO8601(),
    check("search").optional().trim().escape(),
  ],
  getPm25Controller
);

router.get("/activitylist", getActivityListController);
router.get("/cluster", getClusterController);

module.exports = router;
