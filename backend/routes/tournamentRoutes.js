import express from "express";
import { createTournament } from "../controllers/tournamentController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

// @desc    Create a new tournament
// @route   POST /api/tournaments
// @access  Private (Admin only)
router.post("/", protect, authorizeRoles("admin"), createTournament);

export default router;
