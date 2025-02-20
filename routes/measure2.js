// src/routes/measure2.js
const express = require("express");
const {
  getMeasure2,
  createMeasure2,
} = require("../controllers/measure2Controller");

const router = express.Router();

router.get("/", getMeasure2);
router.post("/", createMeasure2);

module.exports = router;
