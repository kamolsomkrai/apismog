// src/routes/measure4.js
const express = require("express");
const {
  getMeasure4,
  upsertMeasure4,
  createMeasure4,
  getMeasure4show,
} = require("../controllers/measure4Controller");

const {
  authenticateTokenFromCookies,
} = require("../middlewares/authenticateToken");
const { authorizeRoles } = require("../middlewares/authorizeRoles");

const router = express.Router();

router.get("/", getMeasure4);
router.put("/", authenticateTokenFromCookies, authorizeRoles("จังหวัด", "เขต"), upsertMeasure4);
router.post("/", authenticateTokenFromCookies, authorizeRoles("จังหวัด", "เขต"), createMeasure4); // If create exists
router.post("/show", authenticateTokenFromCookies, getMeasure4show);

module.exports = router;
