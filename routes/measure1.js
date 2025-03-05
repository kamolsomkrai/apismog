// src/routes/measure1.js
const express = require("express");
const {
  getMeasure1,
  updateMeasure1,
} = require("../controllers/measure1Controller");

const {
  authenticateTokenFromCookies,
} = require("../middlewares/authenticateToken");
const router = express.Router();

router.get("/", getMeasure1);
router.put("/", authenticateTokenFromCookies, updateMeasure1);

module.exports = router;
