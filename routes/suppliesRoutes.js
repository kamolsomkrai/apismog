// routes/suppliesRoutes.js
const express = require("express");
const {
  getAllSupplies,
  getSupply,
  createNewSupply,
  updateExistingSupply,
  deleteExistingSupply,
  getSupplyData,
} = require("../controllers/suppliesController");
const {
  authenticateTokenFromCookies,
} = require("../middlewares/authenticateToken");

const router = express.Router();

// GET /api/supplies - ดึงรายการ supplies ทั้งหมด

router.get("/", authenticateTokenFromCookies, getAllSupplies);

// GET /api/supplies/:id - ดึงรายละเอียดของ supply
router.get("/:id", authenticateTokenFromCookies, getSupply);

// POST /api/supplies - สร้าง supply ใหม่
router.post("/", authenticateTokenFromCookies, createNewSupply);

router.post("/supplydata", authenticateTokenFromCookies, getSupplyData);

// PUT /api/supplies/:id - แก้ไข supply ที่ระบุ
router.put("/:id", authenticateTokenFromCookies, updateExistingSupply);

// DELETE /api/supplies/:id - ลบ supply ที่ระบุ
router.delete("/:id", authenticateTokenFromCookies, deleteExistingSupply);

module.exports = router;
