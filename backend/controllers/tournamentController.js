import Tournament from "../models/tournamentModel.js";
import Sport from "../models/sportModel.js";
import asyncHandler from "express-async-handler";
import { validateTournamentInput } from "../utils/tournamentValidators.js";

// @desc    Create a new tournament
// @route   POST /api/tournaments
// @access  Private (Admin only)
const createTournament = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    sport,
    customRules,
    format,
    registrationStart,
    registrationEnd,
    startDate,
    endDate,
    maxTeams,
    minPlayersPerTeam,
    maxPlayersPerTeam,
  } = req.body;

  const errors = validateTournamentInput(req.body);
  if (errors.length > 0) {
    res.status(400);
    throw new Error(errors.join(". "));
  }

  const selectedSport = await Sport.findById(sport);
  if (!selectedSport) {
    res.status(404);
    throw new Error("Sport not found");
  }

  const tournament = new Tournament({
    name,
    description,
    sport: selectedSport._id,
    customRules: customRules || selectedSport.defaultRules,
    format,
    registrationStart,
    registrationEnd,
    startDate,
    endDate,
    maxTeams,
    minPlayersPerTeam,
    maxPlayersPerTeam,
    createdBy: req.user._id,
  });

  const createdTournament = await tournament.save();
  await createdTournament.populate("sport", "name");
  await createdTournament.populate("createdBy", "firstName lastName");
  res.status(201).json(createdTournament);
});

// @desc    Get all tournaments
// @route   GET /api/tournaments
// @access  Public
const getAllTournaments = asyncHandler(async (req, res) => {
  try {
    const tournaments = await Tournament.find()
      .populate("sport", "name")
      .populate("createdBy", "firstName lastName")
      .sort({ createdAt: -1 });
    res.status(200).json(tournaments);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

export { createTournament, getAllTournaments };
