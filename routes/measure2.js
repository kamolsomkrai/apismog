// src/routes/measure2.js
const express = require("express");
const {
  getMeasure2,
  upsertMeasure2,
} = require("../controllers/measure2Controller");

const router = express.Router();

router.get("/", getMeasure2);
router.put("/", upsertMeasure2);

module.exports = router;
