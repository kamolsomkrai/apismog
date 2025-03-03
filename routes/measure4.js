// src/routes/measure4.js
const express = require("express");
const {
  getMeasure4,
  upsertMeasure4,
  getMeasure4show,
} = require("../controllers/measure4Controller");

const {
  authenticateTokenFromCookies,
} = require("../middlewares/authenticateToken");

const router = express.Router();

router.get("/", getMeasure4);
router.put("/", upsertMeasure4);
router.post("/show", authenticateTokenFromCookies, getMeasure4show);

module.exports = router;
