/**
 * @fileoverview Controller functions for handling tournament operations such as creating, retrieving, updating, and deleting tournaments.
 * @module controllers/tournamentController
 */

import Tournament from "../models/tournamentModel.js";
import Sport from "../models/sportModel.js";
import asyncHandler from "express-async-handler";
import {
  validateTournamentInput,
  validateObjectId,
  validateTournamentUpdate,
} from "../utils/tournamentValidators.js";
import { calculateTournamentStatus } from "../utils/tournamentStatus.js";

/**
 * @function createTournament
 * @desc Create a new tournament
 * @route POST /api/tournaments
 * @access Private (Admin only)
 */
const createTournament = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    sport,
    customRules,
    format,
    groupsStageSettings,
    bestOfMatches,
    registrationStart,
    registrationTeamEnd,
    registrationPlayerEnd,
    startDate,
    endDate,
    maxTeams,
    minPlayersPerTeam,
    maxPlayersPerTeam,
    isOlympiad,
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

  if (format === "group-stage" && !groupsStageSettings) {
    res.status(400);
    throw new Error("groupsStageSettings is required for group-stage format");
  }

  const tournament = new Tournament({
    name,
    description,
    sport: selectedSport._id,
    customRules: customRules || selectedSport.defaultRules,
    format,
    groupsStageSettings,
    bestOfMatches: bestOfMatches || 1,
    registrationStart,
    registrationTeamEnd,
    registrationPlayerEnd,
    startDate,
    endDate,
    maxTeams,
    minPlayersPerTeam,
    maxPlayersPerTeam,
    isOlympiad,
    createdBy: req.user._id,
  });

  tournament.status = calculateTournamentStatus(tournament);
  const createdTournament = await tournament.save();
  await createdTournament.populate("sport", "name");
  await createdTournament.populate("createdBy", "firstName lastName");
  res.status(201).json(createdTournament);
});

/**
 * @function getAllTournaments
 * @desc Get all tournaments
 * @route GET /api/tournaments
 * @access Public
 */
const getAllTournaments = asyncHandler(async (req, res) => {
  try {
    const tournaments = await Tournament.find()
      .populate("sport", "name")
      .populate("createdBy", "firstName lastName")
      .sort({ createdAt: -1 });
    tournaments.forEach((t) => {
      t.status = calculateTournamentStatus(t);
    });
    res.status(200).json(tournaments);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * @function getTournamentById
 * @desc Get a tournament by ID
 * @route GET /api/tournaments/:id
 * @access Public
 * @param {string} id - The ID of the tournament to retrieve
 */
const getTournamentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const errors = validateObjectId(id, "tournament ID");
  if (errors.length > 0) {
    res.status(400);
    throw new Error(errors.join(". "));
  }

  const tournament = await Tournament.findById(id)
    .populate("sport", "name")
    .populate("createdBy", "firstName lastName");

  if (!tournament) {
    res.status(404);
    throw new Error("Tournament not found");
  }

  const newStatus = calculateTournamentStatus(tournament);
  if (tournament.status !== newStatus) {
    tournament.status = newStatus;
    await tournament.save();
  }

  res.status(200).json(tournament);
});

/**
 * @function updateTournament
 * @desc Update a tournament
 * @route PUT /api/tournaments/:id
 * @access Private (Admin only)
 * @param {string} id - The ID of the tournament to update
 */
const updateTournament = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const idErrors = validateObjectId(id, "tournament ID");
  if (idErrors.length > 0) {
    res.status(400);
    throw new Error(idErrors.join(". "));
  }

  const tournament = await Tournament.findById(id);
  if (!tournament) {
    res.status(404);
    throw new Error("Tournament not found");
  }

  const stateErrors = validateTournamentUpdate(tournament);
  if (stateErrors.length > 0) {
    res.status(400);
    throw new Error(stateErrors.join(". "));
  }

  const validationErrors = validateTournamentInput(req.body);
  if (validationErrors.length > 0) {
    res.status(400);
    throw new Error(validationErrors.join(". "));
  }

  const {
    name,
    description,
    sport,
    customRules,
    format,
    groupsStageSettings,
    bestOfMatches,
    registrationStart,
    registrationTeamEnd,
    registrationPlayerEnd,
    startDate,
    endDate,
    maxTeams,
    minPlayersPerTeam,
    maxPlayersPerTeam,
    isOlympiad,
  } = req.body;

  const selectedSport = await Sport.findById(sport);
  if (!selectedSport) {
    res.status(404);
    throw new Error("Sport not found");
  }

  if (format === "group-stage" && !groupsStageSettings) {
    res.status(400);
    throw new Error("groupsStageSettings is required for group-stage format");
  }

  tournament.name = name;
  tournament.description = description;
  tournament.sport = selectedSport._id;
  tournament.customRules = customRules || selectedSport.defaultRules;
  tournament.format = format;
  tournament.groupsStageSettings = format === "group-stage" ? groupsStageSettings : undefined;
  tournament.bestOfMatches = bestOfMatches;
  tournament.registrationStart = registrationStart;
  tournament.registrationTeamEnd = registrationTeamEnd;
  tournament.registrationPlayerEnd = registrationPlayerEnd;
  tournament.startDate = startDate;
  tournament.endDate = endDate;
  tournament.maxTeams = maxTeams;
  tournament.minPlayersPerTeam = minPlayersPerTeam;
  tournament.maxPlayersPerTeam = maxPlayersPerTeam;
  tournament.isOlympiad = isOlympiad;

  tournament.status = calculateTournamentStatus(tournament);

  const updatedTournament = await tournament.save();
  await updatedTournament.populate("sport", "name");
  await updatedTournament.populate("createdBy", "firstName lastName");

  res.status(200).json(updatedTournament);
});

/**
 * @function deleteTournament
 * @desc Delete a tournament
 * @route DELETE /api/tournaments/:id
 * @access Private (Admin only)
 * @param {string} id - The ID of the tournament to delete
 */
const deleteTournament = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const errors = validateObjectId(id, "tournament ID");
  if (errors.length > 0) {
    res.status(400);
    throw new Error(errors.join(". "));
  }

  const tournament = await Tournament.findById(id);
  if (!tournament) {
    res.status(404);
    throw new Error("Tournament not found");
  }

  await tournament.deleteOne();
  res.status(200).json({ message: "Tournament deleted successfully" });
});

export {
  createTournament,
  getAllTournaments,
  getTournamentById,
  updateTournament,
  deleteTournament,
};
