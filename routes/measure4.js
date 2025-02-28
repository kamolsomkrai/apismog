// src/routes/measure4.js
const express = require("express");
const {
  getMeasure4,
  upsertMeasure4,
} = require("../controllers/measure4Controller");

const router = express.Router();

router.get("/", getMeasure4);
router.put("/", upsertMeasure4);

module.exports = router;
