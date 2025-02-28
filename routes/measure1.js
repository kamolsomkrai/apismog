// src/routes/measure1.js
const express = require("express");
const {
  getMeasure1,
  updateMeasure1,
} = require("../controllers/measure1Controller");
const router = express.Router();

router.get("/", getMeasure1);
router.put("/", updateMeasure1);

module.exports = router;
