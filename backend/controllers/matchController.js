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
import {
  generateEliminationBracket,
  generatePlayoffBracket,
} from "../utils/eliminationBracketGenerator.js";

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

/**
 * Genera bracket de eliminación directa
 */
export const createEliminationBracket = async (req, res) => {
  try {
    const { tournamentId } = req.params;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ error: "Torneo no encontrado" });
    }

    // Validar formato
    if (tournament.format !== "elimination") {
      return res
        .status(400)
        .json({ error: "Este torneo no es de eliminación directa" });
    }

    // Obtener equipos
    const teams = await Team.find({ tournament: tournamentId });
    if (teams.length < 2) {
      return res.status(400).json({ error: "Se necesitan al menos 2 equipos" });
    }

    // Eliminar partidos existentes del torneo
    await Match.deleteMany({ tournament: tournamentId });

    // Generar bracket
    const matches = await generateEliminationBracket(tournament, teams);
    const createdMatches = await Match.insertMany(matches, { ordered: false });

    res.status(201).json({
      message: "Bracket de eliminación generado",
      matches: createdMatches,
    });
  } catch (error) {
    console.error("Error generating bracket:", error);
    res.status(500).json({
      error: "Error al generar el bracket",
      details: error.message,
    });
  }
};

/**
 * Genera playoff después de fase de grupos
 */
export const createPlayoffBracket = async (req, res) => {
  try {
    const { tournamentId } = req.params;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ error: "Torneo no encontrado" });
    }

    // Validar formato
    if (tournament.format !== "group-stage") {
      return res
        .status(400)
        .json({ error: "Este torneo no tiene fase de grupos" });
    }

    // Obtener equipos que avanzan
    const standings = await calculateGroupStandings(tournament);
    const advancingTeams = [];

    // Seleccionar los mejores de cada grupo
    Object.values(standings).forEach((group) => {
      advancingTeams.push(
        ...group
          .slice(0, tournament.groupsStageSettings.teamsAdvancingPerGroup)
          .map((team) => team.team)
      );
    });

    if (advancingTeams.length < 2) {
      return res
        .status(400)
        .json({ error: "No hay suficientes equipos para playoff" });
    }

    // Generar bracket
    const matches = await generatePlayoffBracket(tournament, advancingTeams);
    const createdMatches = await Match.insertMany(matches);

    res.status(201).json({
      message: "Playoff generado",
      matches: createdMatches,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error al generar el playoff",
      details: error.message,
    });
  }
};

/**
 * Agrega resultado a serie best-of
 */
export const addSeriesGameResult = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { scoreTeam1, scoreTeam2 } = req.body;

    const match = await Match.findById(matchId)
      .populate("tournament", "bestOfMatches")
      .populate("team1", "_id name")
      .populate("team2", "_id name");

    if (!match) {
      return res.status(404).json({ error: "Partido no encontrado" });
    }

    // Validar scores
    if (typeof scoreTeam1 !== "number" || typeof scoreTeam2 !== "number") {
      return res
        .status(400)
        .json({ error: "Los scores deben ser números válidos" });
    }

    // Agregar nuevo juego a la serie
    const newGame = {
      scoreTeam1,
      scoreTeam2,
      date: new Date(),
      winner:
        scoreTeam1 > scoreTeam2
          ? match.team1._id
          : scoreTeam1 < scoreTeam2
          ? match.team2._id
          : null,
    };

    match.seriesMatches.push(newGame);

    // Calcular sumatorias de scores
    const totalScore1 = match.seriesMatches.reduce(
      (sum, game) => sum + game.scoreTeam1,
      0
    );
    const totalScore2 = match.seriesMatches.reduce(
      (sum, game) => sum + game.scoreTeam2,
      0
    );

    // Actualizar scores globales (siempre)
    match.scoreTeam1 = totalScore1;
    match.scoreTeam2 = totalScore2;

    // Calcular victorias (para series)
    const winsTeam1 = match.seriesMatches.filter(
      (g) => g.winner && g.winner.equals(match.team1._id)
    ).length;
    const winsTeam2 = match.seriesMatches.filter(
      (g) => g.winner && g.winner.equals(match.team2._id)
    ).length;

    const requiredWins = Math.floor(match.tournament.bestOfMatches / 2) + 1;

    // Actualizar seriesScore (formato: "victoriasEquipo1-victoriasEquipo2 | totalScore1-totalScore2")
    match.seriesScore = `${winsTeam1}-${winsTeam2} | ${totalScore1}-${totalScore2}`;

    // Determinar si hay ganador
    if (winsTeam1 >= requiredWins || winsTeam2 >= requiredWins) {
      match.seriesWinner =
        winsTeam1 >= requiredWins ? match.team1._id : match.team2._id;
      match.status = "completed";
      match.winner = match.seriesWinner;

      // Actualizar siguiente partido en el bracket
      if (match.nextMatchBracketId) {
        await updateNextMatch(
          match.tournament,
          match.nextMatchBracketId,
          match.seriesWinner
        );
      }
    } else if (match.seriesMatches.length >= match.tournament.bestOfMatches) {
      // Manejar empate cuando se juegan todos los partidos
      if (totalScore1 > totalScore2) {
        match.seriesWinner = match.team1._id;
      } else if (totalScore2 > totalScore1) {
        match.seriesWinner = match.team2._id;
      } else {
        // Empate exacto - sorteo
        match.seriesWinner = [match.team1._id, match.team2._id][
          Math.floor(Math.random() * 2)
        ];
      }

      match.status = "completed";
      match.winner = match.seriesWinner;

      if (match.nextMatchBracketId) {
        await updateNextMatch(
          match.tournament,
          match.nextMatchBracketId,
          match.seriesWinner
        );
      }
    } else {
      match.status = "in-progress";
    }

    await match.save();

    // Populate para mejor respuesta
    const populatedMatch = await Match.findById(matchId)
      .populate("team1", "name")
      .populate("team2", "name")
      .populate("winner", "name")
      .populate("seriesWinner", "name");

    res.status(200).json(populatedMatch);
  } catch (error) {
    console.error("Error adding series result:", error);
    res.status(500).json({
      error: "Error al registrar resultado",
      details: error.message,
    });
  }
};

// Función auxiliar para actualizar siguiente partido
async function updateNextMatch(tournamentId, nextMatchBracketId, winnerTeamId) {
  const nextMatch = await Match.findOne({
    tournament: tournamentId,
    bracketId: nextMatchBracketId,
  });

  if (!nextMatch) return;

  // Determinar si el ganador va a team1 o team2
  const isFirstSpot = !nextMatch.team1;
  const updateField = isFirstSpot ? "team1" : "team2";

  // Verificar que no se asigne el mismo equipo dos veces
  if (
    (isFirstSpot && nextMatch.team2 && nextMatch.team2.equals(winnerTeamId)) ||
    (!isFirstSpot && nextMatch.team1 && nextMatch.team1.equals(winnerTeamId))
  ) {
    throw new Error(
      "Conflicto: el equipo ya está asignado en el siguiente partido"
    );
  }

  nextMatch[updateField] = winnerTeamId;

  // Cambiar estado si ambos equipos están asignados
  if (nextMatch.team1 && nextMatch.team2) {
    nextMatch.status = "scheduled";
  }

  await nextMatch.save();
}

/**
 * Obtiene el bracket completo
 */
export const getBracket = async (req, res) => {
  try {
    const { tournamentId } = req.params;

    const matches = await Match.find({ tournament: tournamentId })
      .populate("team1", "name")
      .populate("team2", "name")
      .populate("winner", "name")
      .populate("seriesWinner", "name")
      .sort("bracketId");

    // Organizar por rondas
    const bracket = {};
    matches.forEach((match) => {
      if (!bracket[match.round]) {
        bracket[match.round] = [];
      }
      bracket[match.round].push(match);
    });

    res.status(200).json(bracket);
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener el bracket",
      details: error.message,
    });
  }
};
