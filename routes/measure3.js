// src/routes/measure3.js
const express = require("express");
const {
  getMeasure3,
  createMeasure3,
} = require("../controllers/measure3Controller");

const router = express.Router();

router.get("/", getMeasure3);
router.post("/", createMeasure3);

module.exports = router;
