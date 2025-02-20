// src/routes/measure1.js
const express = require("express");
const {
  getMeasure1,
  createMeasure1,
} = require("../controllers/measure1Controller");

const router = express.Router();

router.get("/", getMeasure1);
router.post("/", createMeasure1);

module.exports = router;
