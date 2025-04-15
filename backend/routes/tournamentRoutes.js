import express from "express";
import {
  createTournament,
  getAllTournaments,
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

export default router;
