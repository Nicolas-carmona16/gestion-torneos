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
import {
  validateVolleyballSets,
  calculateVolleyballResult,
  isVolleyball,
} from "../utils/volleyballUtils.js";

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
      .populate("winner", "name")
      .populate("scorers.playerId", "fullName firstName lastName")
      .populate("scorers.teamId", "name");

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
    }).populate("team1 team2", "name"); // Populate para los equipos

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
      standings[group] = await calculateGroupStandings(
        groupMatches,
        tournament
      );
    }

    // Populate los nombres de los equipos en los standings
    for (const group of Object.keys(standings)) {
      for (const standing of standings[group]) {
        if (typeof standing.team === "string") {
          const team = await Team.findById(standing.team).select("name");
          standing.team = team || {
            _id: standing.team,
            name: "Equipo eliminado",
          };
        }
      }
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

    const match = await Match.findById(matchId).populate("tournament", "sport");
    if (!match) {
      return res.status(404).json({ error: "Partido no encontrado" });
    }

    // Obtener reglas del deporte
    const tournament = await Tournament.findById(match.tournament).populate(
      "sport"
    );
    
    // Usar customRules del torneo si existen, sino usar defaultRules del deporte
    const sportRules = tournament.customRules || tournament.sport.defaultRules;

    // Validar si es voleibol y se están actualizando sets
    if (isVolleyball(tournament.sport.name) && updateData.setScores) {
      // Validar sets de voleibol
      const validation = validateVolleyballSets(
        updateData.setScores,
        sportRules
      );
      if (!validation.isValid) {
        return res.status(400).json({
          error: "Datos de sets inválidos",
          details: validation.errors,
        });
      }

      // Calcular resultado del partido
      const result = calculateVolleyballResult(
        updateData.setScores,
        sportRules
      );

      // Actualizar campos de sets
      match.setsTeam1 = result.setsTeam1;
      match.setsTeam2 = result.setsTeam2;
      match.setScores = updateData.setScores;

      // Determinar ganador
      if (result.winner === "team1") {
        match.winner = match.team1;
      } else if (result.winner === "team2") {
        match.winner = match.team2;
      } else {
        match.winner = null;
      }

      // Marcar como completado si el partido terminó
      if (result.isComplete) {
        match.status = "completed";
      }

      // Actualizar otros campos si se proporcionan
      if (updateData.date !== undefined) match.date = updateData.date;
      if (updateData.time !== undefined) match.time = updateData.time;
      if (updateData.location !== undefined)
        match.location = updateData.location;
      if (updateData.description !== undefined)
        match.description = updateData.description;

      await match.save();
    } else {
      // Lógica original para otros deportes
      const updatedMatch = await Match.findByIdAndUpdate(matchId, updateData, {
        new: true,
        runValidators: true,
      });

      // Si se actualiza el resultado, determinar el ganador
      if (
        updateData.scoreTeam1 !== undefined &&
        updateData.scoreTeam2 !== undefined
      ) {
        if (updateData.scoreTeam1 > updateData.scoreTeam2) {
          updatedMatch.winner = updatedMatch.team1;
        } else if (updateData.scoreTeam1 < updateData.scoreTeam2) {
          updatedMatch.winner = updatedMatch.team2;
        } else {
          updatedMatch.winner = null; // Empate
        }

        updatedMatch.status = "completed";
        await updatedMatch.save();
      }
    }

    // Populate para mejor respuesta
    const populatedMatch = await Match.findById(matchId)
      .populate("team1", "name")
      .populate("team2", "name")
      .populate("winner", "name")
      .populate("scorers.playerId", "fullName firstName lastName")
      .populate("scorers.teamId", "name");

    res.status(200).json(populatedMatch);
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
      .populate("scorers.playerId", "fullName firstName lastName")
      .populate("scorers.teamId", "name")
      .populate({
        path: "tournament",
        select: "name sport customRules",
        populate: {
          path: "sport",
          select: "name",
        },
      })
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
      .populate("team2", "name")
      .populate("scorers.playerId", "fullName firstName lastName")
      .populate("scorers.teamId", "name")
      .populate({
        path: "tournament",
        select: "name sport customRules",
        populate: {
          path: "sport",
          select: "name",
        },
      });

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

    // Verificar que existan partidos de fase de grupos
    const groupMatches = await Match.find({
      tournament: tournamentId,
      round: "group",
    });

    if (groupMatches.length === 0) {
      return res.status(400).json({
        error: "No se han generado partidos de fase de grupos para este torneo",
      });
    }

    // Verificar que todos los partidos de fase de grupos estén completados
    const completedMatches = groupMatches.filter(
      (match) => match.status === "completed"
    );
    if (completedMatches.length !== groupMatches.length) {
      return res.status(400).json({
        error:
          "Todos los partidos de la fase de grupos deben estar completados antes de generar el playoff",
      });
    }

    // Agrupar partidos por grupo
    const matchesByGroup = {};
    groupMatches.forEach((match) => {
      if (!matchesByGroup[match.group]) {
        matchesByGroup[match.group] = [];
      }
      matchesByGroup[match.group].push(match);
    });

    // Calcular posiciones para cada grupo
    const standings = {};
    for (const [group, matches] of Object.entries(matchesByGroup)) {
      standings[group] = await calculateGroupStandings(matches, tournament);
    }

    // Obtener equipos que avanzan
    const advancingTeams = [];

    // Seleccionar los mejores de cada grupo según la configuración del torneo
    Object.values(standings).forEach((group) => {
      const teamsToAdvance = group
        .slice(0, tournament.groupsStageSettings.teamsAdvancingPerGroup)
        .map((standing) => standing.team);

      advancingTeams.push(...teamsToAdvance);
    });

    if (advancingTeams.length < 2) {
      return res.status(400).json({
        error:
          "No hay suficientes equipos para generar el playoff. Se necesitan al menos 2 equipos.",
      });
    }

    // Verificar que no existan partidos de playoff ya generados
    const existingPlayoffMatches = await Match.find({
      tournament: tournamentId,
      round: {
        $in: [
          "round-of-16",
          "quarter-finals",
          "semi-finals",
          "final",
          "third-place",
        ],
      },
    });

    if (existingPlayoffMatches.length > 0) {
      return res.status(400).json({
        error: "Ya existen partidos de playoff para este torneo",
      });
    }

    // Generar bracket de playoff
    const matches = await generatePlayoffBracket(tournament, advancingTeams);
    const createdMatches = await Match.insertMany(matches);

    res.status(201).json({
      message: "Playoff generado exitosamente",
      matches: createdMatches,
      advancingTeams: advancingTeams.length,
      groupsProcessed: Object.keys(standings).length,
    });
  } catch (error) {
    console.error("Error generating playoff:", error);
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
      .populate("scorers.playerId", "fullName firstName lastName")
      .populate("scorers.teamId", "name")
      .populate({
        path: "tournament",
        select: "name sport customRules",
        populate: {
          path: "sport",
          select: "name",
        },
      })
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

/**
 * Agrega goleadores a un partido
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const addScorers = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { scorers } = req.body;

    const match = await Match.findById(matchId)
      .populate("tournament", "sport")
      .populate("team1", "name")
      .populate("team2", "name");

    if (!match) {
      return res.status(404).json({ error: "Partido no encontrado" });
    }

    // Verificar que el partido sea de fútbol o fútbol sala
    const tournament = await Tournament.findById(match.tournament).populate(
      "sport",
      "name"
    );

    if (!["Fútbol", "Fútbol Sala"].includes(tournament.sport.name)) {
      return res.status(400).json({
        error:
          "Los goleadores solo se pueden registrar en partidos de fútbol y fútbol sala",
      });
    }

    // Validar que el partido esté completado o en progreso
    if (match.status !== "completed" && match.status !== "in-progress") {
      return res.status(400).json({
        error:
          "Solo se pueden agregar goleadores a partidos completados o en progreso",
      });
    }

    // Validar que los goleadores pertenezcan a los equipos del partido
    const validTeamIds = [
      match.team1._id.toString(),
      match.team2._id.toString(),
    ];

    for (const scorer of scorers) {
      if (!validTeamIds.includes(scorer.teamId.toString())) {
        return res.status(400).json({
          error: `El jugador ${scorer.playerId} no pertenece a ninguno de los equipos del partido`,
        });
      }
    }

    // Validar que el total de goles coincida con el resultado del partido
    const totalGoals = scorers.reduce((sum, scorer) => sum + scorer.goals, 0);
    const matchTotalGoals = (match.scoreTeam1 || 0) + (match.scoreTeam2 || 0);

    if (totalGoals !== matchTotalGoals) {
      return res.status(400).json({
        error: `El total de goles (${totalGoals}) debe coincidir con el resultado del partido (${matchTotalGoals})`,
      });
    }

    // Limpiar goleadores existentes y agregar los nuevos
    match.scorers = scorers;
    await match.save();

    // Populate para mejor respuesta
    const populatedMatch = await Match.findById(matchId)
      .populate("team1", "name")
      .populate("team2", "name")
      .populate("scorers.playerId", "fullName")
      .populate("scorers.teamId", "name");

    res.status(200).json(populatedMatch);
  } catch (error) {
    console.error("Error adding scorers:", error);
    res.status(500).json({
      error: "Error al agregar goleadores",
      details: error.message,
    });
  }
};

/**
 * Obtiene la tabla de goleadores de un torneo
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const getTournamentScorers = async (req, res) => {
  try {
    const { tournamentId } = req.params;

    const tournament = await Tournament.findById(tournamentId).populate(
      "sport",
      "name"
    );

    if (!tournament) {
      return res.status(404).json({ error: "Torneo no encontrado" });
    }

    // Verificar que el torneo sea de fútbol o fútbol sala
    if (!["Fútbol", "Fútbol Sala"].includes(tournament.sport.name)) {
      return res.status(400).json({
        error:
          "La tabla de goleadores solo está disponible para torneos de fútbol y fútbol sala",
      });
    }

    // Obtener todos los partidos completados o en progreso del torneo con goleadores
    const matches = await Match.find({
      tournament: tournamentId,
      status: { $in: ["completed", "in-progress"] },
      scorers: { $exists: true, $ne: [] },
    })
      .populate("scorers.playerId", "fullName")
      .populate("scorers.teamId", "name");

    // Calcular estadísticas de goleadores
    const scorersStats = {};

    matches.forEach((match) => {
      match.scorers.forEach((scorer) => {
        const playerId = scorer.playerId._id.toString();
        const playerName = scorer.playerId.fullName;
        const teamName = scorer.teamId.name;

        if (!scorersStats[playerId]) {
          scorersStats[playerId] = {
            player: {
              _id: scorer.playerId._id,
              fullName: playerName,
            },
            team: {
              _id: scorer.teamId._id,
              name: teamName,
            },
            totalGoals: 0,
            matches: 0,
          };
        }

        scorersStats[playerId].totalGoals += scorer.goals;
        scorersStats[playerId].matches += 1;
      });
    });

    // Convertir a array y ordenar por goles
    const scorersTable = Object.values(scorersStats).sort((a, b) => {
      // Primero por total de goles (descendente)
      if (b.totalGoals !== a.totalGoals) {
        return b.totalGoals - a.totalGoals;
      }
      // En caso de empate, por nombre del jugador
      return a.player.fullName.localeCompare(b.player.fullName);
    });

    res.status(200).json({
      tournament: {
        _id: tournament._id,
        name: tournament.name,
        sport: tournament.sport.name,
      },
      scorers: scorersTable,
    });
  } catch (error) {
    console.error("Error getting tournament scorers:", error);
    res.status(500).json({
      error: "Error al obtener la tabla de goleadores",
      details: error.message,
    });
  }
};

export const getMatchById = async (req, res) => {
  try {
    const { matchId } = req.params;

    const match = await Match.findById(matchId)
      .populate("team1", "name")
      .populate("team2", "name")
      .populate("winner", "name")
      .populate("scorers.playerId", "fullName firstName lastName")
      .populate("scorers.teamId", "name")
      .populate({
        path: "tournament",
        select: "name sport customRules",
        populate: {
          path: "sport",
          select: "name",
        },
      });

    if (!match) {
      return res.status(404).json({ error: "Partido no encontrado" });
    }

    res.status(200).json(match);
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener el partido",
      details: error.message,
    });
  }
};

/**
 * Verifica si ya existen partidos de playoff para un torneo
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const checkPlayoffExists = async (req, res) => {
  try {
    const { tournamentId } = req.params;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ error: "Torneo no encontrado" });
    }

    // Verificar que existan partidos de fase de grupos
    const groupMatches = await Match.find({
      tournament: tournamentId,
      round: "group",
    });

    if (groupMatches.length === 0) {
      return res.status(200).json({
        hasPlayoff: false,
        canGenerate: false,
        reason: "No se han generado partidos de fase de grupos",
      });
    }

    // Verificar si todos los partidos de fase de grupos están completados
    const completedMatches = groupMatches.filter(
      (match) => match.status === "completed"
    );
    const allCompleted = completedMatches.length === groupMatches.length;

    // Verificar si ya existen partidos de playoff
    const playoffMatches = await Match.find({
      tournament: tournamentId,
      round: {
        $in: [
          "round-of-16",
          "quarter-finals",
          "semi-finals",
          "final",
          "third-place",
        ],
      },
    });

    const hasPlayoff = playoffMatches.length > 0;

    res.status(200).json({
      hasPlayoff,
      canGenerate: allCompleted && !hasPlayoff,
      groupStageComplete: allCompleted,
      totalGroupMatches: groupMatches.length,
      completedGroupMatches: completedMatches.length,
      playoffMatchesCount: playoffMatches.length,
      reason: hasPlayoff
        ? "Ya existen partidos de playoff"
        : !allCompleted
        ? "No todos los partidos de fase de grupos están completados"
        : "Listo para generar playoff",
    });
  } catch (error) {
    console.error("Error checking playoff status:", error);
    res.status(500).json({
      error: "Error al verificar estado del playoff",
      details: error.message,
    });
  }
};
