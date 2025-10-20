/**
 * @fileoverview Defines all tournament-related API routes.
 * @module routes/tournamentRoutes
 */

import express from "express";
import {
  createTournament,
  getAllTournaments,
  getTournamentById,
  updateTournament,
  deleteTournament,
  patchTournamentRulesUrl,
  patchTournamentResolutionsUrl,
  getTournamentWildcards,
} from "../controllers/tournamentController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * Public routes
 */

/**
 * @route GET /api/tournaments
 * @desc Get all tournaments
 * @access Public
 */
router.get("/", getAllTournaments);

/**
 * @route GET /api/tournaments/:id
 * @desc Get tournament by ID
 * @access Public
 */
router.get("/:id", getTournamentById);

/**
 * Admin-only routes
 */

/**
 * @route POST /api/tournaments
 * @desc Create a new tournament
 * @access Private (Admin only)
 */
router.post("/", protect, authorizeRoles("admin"), createTournament);

/**
 * @route PUT /api/tournaments/:id
 * @desc Update a tournament by ID
 * @access Private (Admin only)
 */
router.put("/:id", protect, authorizeRoles("admin"), updateTournament);

/**
 * @route DELETE /api/tournaments/:id
 * @desc Delete a tournament by ID
 * @access Private (Admin only)
 */
router.delete("/:id", protect, authorizeRoles("admin"), deleteTournament);

/**
 * @route PATCH /api/tournaments/:id/rules-url
 * @desc Update only the rulesUrl (reglamento) of a tournament
 * @access Private (Admin only)
 */
router.patch("/:id/rules-url", protect, authorizeRoles("admin"), patchTournamentRulesUrl);

/**
 * @route PATCH /api/tournaments/:id/resolutions-url
 * @desc Update only the resolutionsUrl (resoluciones) of a tournament
 * @access Private (Admin only)
 */
router.patch("/:id/resolutions-url", protect, authorizeRoles("admin"), patchTournamentResolutionsUrl);

/**
 * @route GET /api/tournaments/:id/wildcards
 * @desc Get wildcard (comodín) team IDs for a tournament
 * @access Public
 */
router.get("/:id/wildcards", getTournamentWildcards);

export default router;
