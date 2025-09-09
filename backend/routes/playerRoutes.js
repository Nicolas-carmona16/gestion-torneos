/**
 * @fileoverview Defines all player-related API routes.
 * @module routes/playerRoutes
 */

import express from "express";
import { getAllPlayers, downloadPlayersExcel } from "../controllers/playerController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * Protected routes (Admin only)
 */

/**
 * @route GET /api/players
 * @desc Get all players
 * @access Private (Admin only)
 */
router.get("/", protect, authorizeRoles("admin"), getAllPlayers);

/**
 * @route GET /api/players/download-excel
 * @desc Download all players data as Excel file
 * @access Private (Admin only)
 */
router.get("/download-excel", protect, authorizeRoles("admin"), downloadPlayersExcel);

export default router; 