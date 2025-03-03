// src/routes/measure3.js
const express = require("express");
const {
  getMeasure3,
  upsertMeasure3,
  getMeasure3show,
} = require("../controllers/measure3Controller");

const {
  authenticateTokenFromCookies,
} = require("../middlewares/authenticateToken");

const router = express.Router();

router.get("/", getMeasure3);
router.put("/", upsertMeasure3);
router.post("/show", authenticateTokenFromCookies, getMeasure3show);

module.exports = router;
