const express = require("express");
const { check } = require("express-validator");
const {
  getPatientInjuryDead,
  deletePatientInjuryDead,
  getInjuryRti,
  getRiskVehicle,
  getRiskRti,
  getRiskRoad,
} = require("../controllers/pherController");
const {
  authenticateTokenFromCookies,
} = require("../middlewares/authenticateToken");

const router = express.Router();

router.post(
  "/getpatientinjurydead",
  [check("start_date").isISO8601(), check("end_date").isISO8601()],
  authenticateTokenFromCookies,
  getPatientInjuryDead
);

router.put(
  "/deletepatientinjurydead",
  [check("guid").optional().trim().escape()],
  authenticateTokenFromCookies,
  deletePatientInjuryDead
);

router.post(
  "/getinjuryrti",
  [check("start_date").isISO8601(), check("end_date").isISO8601()],
  getInjuryRti
);

router.post(
  "/getriskvehicle",
  [check("start_date").isISO8601(), check("end_date").isISO8601()],
  getRiskVehicle
);

router.post(
  "/riskrti",
  [check("start_date").isISO8601(), check("end_date").isISO8601()],
  getRiskRti
);

router.post(
  "/riskroad",
  [check("start_date").isISO8601(), check("end_date").isISO8601()],
  getRiskRoad
);

module.exports = router;
