// src/routes/measure4.js
const express = require("express");
const {
  getMeasure4,
  createMeasure4,
} = require("../controllers/measure4Controller");

const router = express.Router();

router.get("/", getMeasure4);
router.post("/", createMeasure4);

module.exports = router;
