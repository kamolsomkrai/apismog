const express = require("express");
const { check } = require("express-validator");
const {
  getPatientInjuryDead,
  deletePatientInjuryDead,
  getInjuryRtiController,
  getRiskVehicleController,
  getRiskRtiController,
  getRiskRoadController,
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
  getInjuryRtiController
);

router.post(
  "/getriskvehicle",
  [check("start_date").isISO8601(), check("end_date").isISO8601()],
  getRiskVehicleController
);

router.post(
  "/riskrti",
  [check("start_date").isISO8601(), check("end_date").isISO8601()],
  getRiskRtiController
);

router.post(
  "/riskroad",
  [check("start_date").isISO8601(), check("end_date").isISO8601()],
  getRiskRoadController
);

module.exports = router;
