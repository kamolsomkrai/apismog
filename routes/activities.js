// src/routes/activities.js
const express = require("express");
const {
  getActivities,
  createActivity,
} = require("../controllers/activitiesController");
const {
  authenticateTokenFromCookies,
} = require("../middlewares/authenticateToken");

const router = express.Router();

router.get("/", getActivities);
router.post("/", authenticateTokenFromCookies, createActivity);

module.exports = router;
