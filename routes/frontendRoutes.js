// routes/frontendRoutes.js
const express = require("express");
const {
  getSupplyList,
  getSummarys,
} = require("../controllers/frontendController");
const {
  authenticateTokenFromCookies,
} = require("../middlewares/authenticateToken");

const router = express.Router();

router.get("/supplielist", getSupplyList);
router.get("/summary", getSummarys);
module.exports = router;
