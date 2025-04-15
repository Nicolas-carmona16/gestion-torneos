import express from "express";
import {
  createTournament,
  getAllTournaments,
  getTournamentById,
  updateTournament,
  deleteTournament,
} from "../controllers/tournamentController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * Public routes
 */

// @desc    Get all tournaments
// @route   GET /api/tournaments
// @access  Public
router.get("/", getAllTournaments);

// @desc    Get tournament by ID
// @route   GET /api/tournaments/:id
// @access  Public
router.get("/:id", getTournamentById);

/**
 * Admin-only routes
 */

// @desc    Create a new tournament
// @route   POST /api/tournaments
// @access  Private (Admin only)
router.post("/", protect, authorizeRoles("admin"), createTournament);

// @desc    Update a tournament
// @route   PUT /api/tournaments/:id
// @access  Private (Admin only)
router.put("/:id", protect, authorizeRoles("admin"), updateTournament);

// @desc    Delete a tournament
// @route   DELETE /api/tournaments/:id
// @access  Private (Admin only)
router.delete("/:id", protect, authorizeRoles("admin"), deleteTournament);

export default router;
