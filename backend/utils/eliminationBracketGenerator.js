/**
 * @file eliminationBracketGenerator.js
 * @module utils/eliminationBracketGenerator
 * @description Generador de brackets de eliminación directa
 */

import Match from "../models/matchModel.js";

// Niveles de bracket
const ROUNDS = {
  1: "final",
  2: "semi-finals",
  4: "quarter-finals",
  8: "round-of-16",
  16: "round-of-32",
};

/**
 * Genera el bracket de eliminación directa
 * @param {Object} tournament - Torneo
 * @param {Array} teams - Equipos participantes
 * @returns {Array} Partidos generados
 */
export const generateEliminationBracket = async (tournament, teams) => {
  const matches = [];
  let numTeams = teams.length;

  // Determinar la ronda inicial basada en el número de equipos
  const initialRound = getRoundByTeamCount(numTeams);

  // Shuffle aleatorio justo
  const shuffledTeams = [...teams].sort(() => 0.5 - Math.random());

  // Generar primera ronda
  let bracketId = 1;
  const firstRoundMatches = [];

  for (let i = 0; i < shuffledTeams.length; i += 2) {
    const matchData = {
      tournament: tournament._id,
      round: initialRound,
      status: "scheduled",
      bracketId: `M${bracketId++}`,
      isBestOfSeries: tournament.bestOfMatches > 1,
    };

    // Asignar equipos si existen
    if (shuffledTeams[i]) {
      matchData.team1 = shuffledTeams[i]._id;
    }

    if (shuffledTeams[i + 1]) {
      matchData.team2 = shuffledTeams[i + 1]._id;
    } else {
      // Si no hay segundo equipo, el primero avanza automáticamente
      matchData.status = "walkover";
      matchData.winner = shuffledTeams[i]._id;
    }

    firstRoundMatches.push(matchData);
  }

  // Calcular el número total de rondas necesarias
  const totalRounds = Math.ceil(Math.log2(numTeams));

  // Generar estructura completa del bracket
  let currentRoundMatches = firstRoundMatches;
  let currentRoundNumber = 1;

  while (currentRoundNumber < totalRounds) {
    const nextRoundNumber = currentRoundNumber + 1;
    const nextRoundName = getRoundByStage(totalRounds - nextRoundNumber);
    const nextRoundMatches = [];

    // Crear partidos para la siguiente ronda
    for (let i = 0; i < Math.ceil(currentRoundMatches.length / 2); i++) {
      const matchData = {
        tournament: tournament._id,
        round: nextRoundName,
        status: "pending", // Estado inicial para partidos sin equipos definidos
        bracketId: `M${bracketId++}`,
        isBestOfSeries: tournament.bestOfMatches > 1,
      };

      nextRoundMatches.push(matchData);
    }

    // Asignar nextMatchBracketId a los partidos de la ronda actual
    currentRoundMatches.forEach((match, index) => {
      const nextMatchIndex = Math.floor(index / 2);
      if (nextRoundMatches[nextMatchIndex]) {
        match.nextMatchBracketId = nextRoundMatches[nextMatchIndex].bracketId;
      }
    });

    matches.push(...currentRoundMatches);
    currentRoundMatches = nextRoundMatches;
    currentRoundNumber++;
  }

  // Agregar los partidos de la última ronda
  matches.push(...currentRoundMatches);

  return matches;
};

// Helper para determinar la ronda por cantidad de equipos
function getRoundByTeamCount(count) {
  const rounds = {
    2: "final",
    4: "semi-finals",
    8: "quarter-finals",
    16: "round-of-16",
    32: "round-of-32",
  };
  return rounds[count] || "qualifying-round";
}

// Helper para determinar el nombre de la ronda por etapa
function getRoundByStage(stage) {
  const stages = {
    0: "final",
    1: "semi-finals",
    2: "quarter-finals",
    3: "round-of-16",
    4: "round-of-32",
  };
  return stages[stage] || "qualifying-round";
}

/**
 * Genera partidos de eliminación directa después de fase de grupos
 * @param {Object} tournament - Torneo
 * @param {Array} advancingTeams - Equipos que avanzan
 * @returns {Array} Partidos generados
 */
export const generatePlayoffBracket = async (tournament, advancingTeams) => {
  return generateEliminationBracket(tournament, advancingTeams);
};
