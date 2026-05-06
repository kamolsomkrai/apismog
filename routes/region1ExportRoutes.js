const express = require("express");
const router = express.Router();
const region1ExportController = require("../controllers/region1ExportController");

/**
 * @swagger
 * tags:
 *   name: Region1Export
 *   description: Endpoints for Health Region 1 Data Export
 */

/**
 * @swagger
 * /api/region1_export/pm25:
 *   post:
 *     summary: Get PM2.5 data for Region 1
 *     tags: [Region1Export]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               start_date:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-01"
 *               end_date:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-31"
 *               page:
 *                 type: integer
 *                 example: 1
 *               limit:
 *                 type: integer
 *                 example: 50
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Internal server error
 */
router.post("/pm25", region1ExportController.getPm25);

/**
 * @swagger
 * /api/region1_export/preparation:
 *   post:
 *     summary: Get preparation reports for Region 1
 *     tags: [Region1Export]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               start_date:
 *                 type: string
 *               end_date:
 *                 type: string
 *               page:
 *                 type: integer
 *               limit:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Success
 */
router.post("/preparation", region1ExportController.getPreparation);

/**
 * @swagger
 * /api/region1_export/emergency:
 *   post:
 *     summary: Get emergency reports for Region 1
 *     tags: [Region1Export]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               start_date:
 *                 type: string
 *               end_date:
 *                 type: string
 *               page:
 *                 type: integer
 *               limit:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Success
 */
router.post("/emergency", region1ExportController.getEmergency);

/**
 * @swagger
 * /api/region1_export/health:
 *   post:
 *     summary: Get health reports for Region 1
 *     tags: [Region1Export]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               start_date:
 *                 type: string
 *               end_date:
 *                 type: string
 *               page:
 *                 type: integer
 *               limit:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Success
 */
router.post("/health", region1ExportController.getHealth);

module.exports = router;

