const express = require("express");
const router = express.Router();
const region1ExportController = require("../controllers/region1ExportController");

// Endpoints for Health Region 1 Data Export
router.post("/pm25", region1ExportController.getPm25);
router.post("/preparation", region1ExportController.getPreparation);
router.post("/emergency", region1ExportController.getEmergency);
router.post("/health", region1ExportController.getHealth);

module.exports = router;
