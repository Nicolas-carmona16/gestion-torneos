/**
 * @fileoverview Defines all statistics-related API routes for admin dashboard
 * @module routes/statisticsRoutes
 */

import express from "express";
import {
  getDashboardStats,
  getTournamentStats,
  getParticipationStats,
  getSportsStats,
  getActivityStats,
} from "../controllers/statisticsController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * All routes are protected and require admin role
 */

/**
 * @route GET /api/statistics/dashboard
 * @desc Get general dashboard statistics
 * @access Private (Admin only)
 */
router.get("/dashboard", protect, authorizeRoles("admin"), getDashboardStats);

/**
 * @route GET /api/statistics/tournaments
 * @desc Get detailed tournament statistics
 * @access Private (Admin only)
 */
router.get("/tournaments", protect, authorizeRoles("admin"), getTournamentStats);

/**
 * @route GET /api/statistics/participation
 * @desc Get participation statistics (teams and players)
 * @access Private (Admin only)
 */
router.get("/participation", protect, authorizeRoles("admin"), getParticipationStats);

/**
 * @route GET /api/statistics/sports
 * @desc Get sports and match statistics
 * @access Private (Admin only)
 */
router.get("/sports", protect, authorizeRoles("admin"), getSportsStats);

/**
 * @route GET /api/statistics/activity
 * @desc Get activity and changelog statistics
 * @access Private (Admin only)
 */
router.get("/activity", protect, authorizeRoles("admin"), getActivityStats);

export default router;
