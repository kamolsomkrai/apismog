// routes/frontendRoutes.js
const express = require("express");
const {
  getSupplyList,
  getSummarys,
} = require("../controllers/frontendController");

const {
  getSupplyDatas,
  getSupplyHospital,
} = require("../controllers/suppliesController");

const { getHospitalList } = require("../controllers/listController");

const {
  authenticateTokenFromCookies,
} = require("../middlewares/authenticateToken");

const router = express.Router();

router.get("/supplielist", getSupplyList);
router.get("/summary", getSummarys);
router.post("/hospitallist", authenticateTokenFromCookies, getHospitalList);
router.post("/supplydata", authenticateTokenFromCookies, getSupplyDatas);
router.get("/supplyhos", authenticateTokenFromCookies, getSupplyHospital);
module.exports = router;
