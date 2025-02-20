// src/routes/activities.js
const express = require("express");
const {
  getActivities,
  createActivity,
} = require("../controllers/activitiesController");

const router = express.Router();

router.get("/", getActivities);
router.post("/", createActivity);

module.exports = router;
