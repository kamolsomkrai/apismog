// src/routes/measure1.js
const express = require("express");
const {
  getMeasure1,
  updateMeasure1,
} = require("../controllers/measure1Controller");
const router = express.Router();

router.get("/", getMeasure1);
router.put("/", updateMeasure1);

router.options("/", (req, res) => {
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.sendStatus(200);
});

module.exports = router;
