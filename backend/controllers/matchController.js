/**
 * @file matchController.js
 * @module controllers/matchController
 * @description This file contains the controller functions for managing matches in a tournament.
 */

import Tournament from "../models/tournamentModel.js";
import Team from "../models/teamModel.js";
import Match from "../models/matchModel.js";
import {
  generateGroups,
  generateGroupStageMatches,
  calculateGroupStandings,
} from "../utils/groupStageGenerator.js";

/**
 * Generates the group stage for a tournament
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const createGroupStage = async (req, res) => {
  try {
    const { tournamentId } = req.params;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ error: "Torneo no encontrado" });
    }

    const now = new Date();
    if (now < tournament.registrationTeamEnd) {
      return res.status(400).json({
        error: "El registro de equipos aún no ha terminado",
      });
    }

    if (now > tournament.startDate) {
      return res.status(400).json({
        error: "El torneo ya ha comenzado",
      });
    }

    if (tournament.format !== "group-stage") {
      return res
        .status(400)
        .json({ error: "Este torneo no es de fase de grupos" });
    }

    // Generar los grupos
    const { groups, unassignedTeams } = await generateGroups(tournament);

    if (unassignedTeams.length > 0) {
      return res.status(400).json({
        error: `No se pudieron asignar ${unassignedTeams.length} equipos a grupos`,
        unassignedTeams,
      });
    }

    // Generar los partidos de la fase de grupos
    const matches = await generateGroupStageMatches(tournament, groups);

    // Actualizar el estado del torneo
    tournament.status = "in progress";
    await tournament.save();

    res.status(201).json({
      message: "Fase de grupos generada exitosamente",
      groups,
      matchesCount: matches.length,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error al generar la fase de grupos",
      details: error.message,
    });
  }
};

/**
 * Obtain all matches of a tournament
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const getTournamentMatches = async (req, res) => {
  try {
    const { tournamentId } = req.params;

    const matches = await Match.find({ tournament: tournamentId })
      .populate("team1", "name")
      .populate("team2", "name")
      .populate("winner", "name");

    res.status(200).json(matches);
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener los partidos",
      details: error.message,
    });
  }
};

/**
 * Obtain the standings of the groups
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const getGroupStandings = async (req, res) => {
  try {
    const { tournamentId } = req.params;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ error: "Torneo no encontrado" });
    }

    if (tournament.format !== "group-stage") {
      return res
        .status(400)
        .json({ error: "Este torneo no es de fase de grupos" });
    }

    const matches = await Match.find({
      tournament: tournamentId,
      round: "group",
    });

    // Agrupar partidos por grupo
    const matchesByGroup = {};
    matches.forEach((match) => {
      if (!matchesByGroup[match.group]) {
        matchesByGroup[match.group] = [];
      }
      matchesByGroup[match.group].push(match);
    });

    // Calcular posiciones para cada grupo
    const standings = {};
    for (const [group, groupMatches] of Object.entries(matchesByGroup)) {
      standings[group] = calculateGroupStandings(groupMatches, tournament);
    }

    res.status(200).json(standings);
  } catch (error) {
    res.status(500).json({
      error: "Error al calcular las posiciones",
      details: error.message,
    });
  }
};

/**
 * Update a match (date, time, result, etc.)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const updateMatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    const updateData = req.body;

    const match = await Match.findByIdAndUpdate(matchId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!match) {
      return res.status(404).json({ error: "Partido no encontrado" });
    }

    // Si se actualiza el resultado, determinar el ganador
    if (
      updateData.scoreTeam1 !== undefined &&
      updateData.scoreTeam2 !== undefined
    ) {
      if (updateData.scoreTeam1 > updateData.scoreTeam2) {
        match.winner = match.team1;
      } else if (updateData.scoreTeam1 < updateData.scoreTeam2) {
        match.winner = match.team2;
      } else {
        match.winner = null; // Empate
      }

      match.status = "completed";
      await match.save();
    }

    res.status(200).json(match);
  } catch (error) {
    res.status(500).json({
      error: "Error al actualizar el partido",
      details: error.message,
    });
  }
};

export const getMatchesByMatchday = async (req, res) => {
  try {
    const { tournamentId } = req.params;

    const matches = await Match.find({
      tournament: tournamentId,
      round: "group",
    })
      .populate("team1", "name")
      .populate("team2", "name")
      .sort("matchday");

    // Agrupar por jornada
    const matchesByMatchday = {};
    matches.forEach((match) => {
      if (!matchesByMatchday[match.matchday]) {
        matchesByMatchday[match.matchday] = [];
      }
      matchesByMatchday[match.matchday].push(match);
    });

    res.status(200).json(matchesByMatchday);
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener partidos por jornada",
      details: error.message,
    });
  }
};

export const getSingleMatchday = async (req, res) => {
  try {
    const { tournamentId, matchday } = req.params;

    const matches = await Match.find({
      tournament: tournamentId,
      round: "group",
      matchday: parseInt(matchday),
    })
      .populate("team1", "name")
      .populate("team2", "name");

    res.status(200).json(matches);
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener la jornada",
      details: error.message,
    });
  }
};
