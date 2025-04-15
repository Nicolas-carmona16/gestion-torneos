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
  res.status(201).json(createdTournament);
});

export { createTournament };
