import express from "express";
import {
  createTournament,
  getAllTournaments,
  getTournamentById,
  updateTournament,
} from "../controllers/tournamentController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

// @desc    Create a new tournament
// @route   POST /api/tournaments
// @access  Private (Admin only)
router.post("/", protect, authorizeRoles("admin"), createTournament);

// @desc    Get all tournaments
// @route   GET /api/tournaments
// @access  Public
router.get("/", getAllTournaments);

// @desc    Get tournament by ID
// @route   GET /api/tournaments/:id
// @access  Public
router.get("/:id", getTournamentById);

// @desc    Update a tournament
// @route   PUT /api/tournaments/:id
// @access  Private (Admin only)
router.put("/:id", protect, authorizeRoles("admin"), updateTournament);

export default router;
