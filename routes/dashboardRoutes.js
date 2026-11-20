// routes/dashboardRoutes.js
const express = require("express");
const { check } = require("express-validator");
const {
  getDiseaseByHospitalController,
  getPm25Controller,
  getActivityListController,
  getClusterController,
} = require("../controllers/dashboardController");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: PublicDashboard
 *   description: Public endpoints for Dashboard data (no authentication required)
 */

/**
 * @swagger
 * /api/public/diseasebyhospital:
 *   post:
 *     summary: Get disease summary by hospital
 *     tags: [PublicDashboard]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               province:
 *                 type: string
 *                 description: Province name or code matching `summary_disease_hospital.province`
 *                 example: "แพร่"
 *               start_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-01-01"
 *               end_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-01-31"
 *               search:
 *                 type: string
 *                 description: Partial match against disease group name
 *                 example: "ทางเดินหายใจ"
 *     responses:
 *       200:
 *         description: List of disease counts by hospital
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post(
  "/diseasebyhospital",
  [
    check("province").optional().trim().escape(),
    check("start_date").optional().isISO8601(),
    check("end_date").optional().isISO8601(),
    check("search").optional().trim().escape(),
  ],
  getDiseaseByHospitalController
);

/**
 * @swagger
 * /api/public/pm25:
 *   post:
 *     summary: Get PM2.5 data by district
 *     tags: [PublicDashboard]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               province:
 *                 type: string
 *                 description: Province name or code matching `pm25_dang.province`
 *                 example: "แพร่"
 *               start_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-01-01"
 *               end_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-01-07"
 *               search:
 *                 type: string
 *                 description: Filter by `event_valid`
 *     responses:
 *       200:
 *         description: List of PM2.5 records with district codes
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post(
  "/pm25",
  [
    check("province").optional().trim().escape(),
    check("start_date").optional().isISO8601(),
    check("end_date").optional().isISO8601(),
    check("search").optional().trim().escape(),
  ],
  getPm25Controller
);

router.get("/activitylist", getActivityListController);

/**
 * @swagger
 * /api/public/cluster:
 *   get:
 *     summary: Get disease cluster summary
 *     tags: [PublicDashboard]
 *     responses:
 *       200:
 *         description: List of cluster summary records
 *       500:
 *         description: Internal server error
 */
router.get("/cluster", getClusterController);

module.exports = router;
