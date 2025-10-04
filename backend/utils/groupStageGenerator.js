/**
 * @file groupStageGenerator.js
 * @module utils/groupStageGenerator
 * @description This file contains the function to generate group stage matches for a tournament.
 */

import Team from "../models/teamModel.js";
import Match from "../models/matchModel.js";
import Tournament from "../models/tournamentModel.js";
import { calculateVolleyballPoints, isVolleyball } from "./volleyballUtils.js";

/**
 * Generates group stage matches for a tournament.
 * @param {ObjectId} tournamentId - The ID of the tournament.
 * @returns {Object} An object containing the groups and not assigned teams.
 */
// utils/groupStageGenerator.js - Modificación de generateGroups
export const generateGroups = async (tournament) => {
  try {
    const teams = await Team.find({ tournament: tournament._id });

    if (teams.length === 0) {
      throw new Error("No hay equipos registrados en el torneo");
    }

    const teamsPerGroup = tournament.groupsStageSettings.teamsPerGroup;
    const numberOfGroups = Math.ceil(teams.length / teamsPerGroup);

    // Mezclar los equipos aleatoriamente
    const shuffledTeams = [...teams].sort(() => 0.5 - Math.random());

    // Crear los grupos
    const groups = {};
    const groupNames = ["A", "B", "C", "D", "E", "F", "G", "H"].slice(
      0,
      numberOfGroups
    );

    // Distribución inicial
    for (let i = 0; i < numberOfGroups; i++) {
      groups[groupNames[i]] = [];
    }

    // Distribuir equipos equitativamente
    let currentGroup = 0;
    shuffledTeams.forEach((team) => {
      const groupName = groupNames[currentGroup % numberOfGroups];
      groups[groupName].push(team);
      currentGroup++;
    });

    return {
      groups,
      unassignedTeams: [], // Ahora todos los equipos se asignan
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Generates the group stage matches using round-robin
 * @param {Object} tournament - Tournament for which the matches will be generated
 * @param {Object} groups - Object with the team groups
 * @returns {Array} Array of generated matches
 */
export const generateGroupStageMatches = async (tournament, groups) => {
  try {
    const roundRobinType = tournament.groupsStageSettings.matchesPerTeamInGroup;
    const allMatches = [];
    const groupMatches = {};

    for (const [groupName, teams] of Object.entries(groups)) {
      groupMatches[groupName] = [];

      // Generar partidos de ida
      for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
          const newMatch = {
            tournament: tournament._id,
            group: groupName,
            round: "group",
            team1: teams[i]._id,
            team2: teams[j]._id,
            status: "scheduled",
          };
          groupMatches[groupName].push(newMatch);
          allMatches.push(newMatch);
        }
      }

      // Generar partidos de vuelta si es round-robin doble
      if (roundRobinType === "double") {
        for (let i = 0; i < teams.length; i++) {
          for (let j = i + 1; j < teams.length; j++) {
            const newMatch = {
              tournament: tournament._id,
              group: groupName,
              round: "group",
              team1: teams[j]._id,
              team2: teams[i]._id,
              status: "scheduled",
            };
            groupMatches[groupName].push(newMatch);
            allMatches.push(newMatch);
          }
        }
      }
    }

    // Generar jornadas
    const matchdays = generateMatchdays(
      groupMatches,
      tournament.groupsStageSettings.teamsPerGroup
    );

    // Asignar jornadas a los partidos
    for (const [groupName, days] of Object.entries(matchdays)) {
      days.forEach((matchesInDay, dayIndex) => {
        matchesInDay.forEach((match) => {
          const foundMatch = allMatches.find(
            (m) =>
              m.team1.equals(match.team1) &&
              m.team2.equals(match.team2) &&
              m.group === groupName
          );
          if (foundMatch) {
            foundMatch.matchday = dayIndex + 1;
          }
        });
      });
    }

    // Guardar partidos
    const createdMatches = await Match.insertMany(allMatches);
    return createdMatches;
  } catch (error) {
    throw error;
  }
};

/**
 * calculate the group standings
 * @param {Array} matches - Matches of the group
 * @param {Object} tournament - Tournament with the scoring rules
 * @returns {Array} Sorted standings table
 */
export const calculateGroupStandings = async (matches, tournament) => {
  const standings = {};
  const customRules = tournament.customRules || {};
  


  // Obtener información del deporte
  const tournamentWithSport = await Tournament.findById(
    tournament._id
  ).populate("sport");
  const sportRules = tournamentWithSport.sport.defaultRules;
  const isVolleyballSport = isVolleyball(tournamentWithSport.sport.name);

  // Extraer puntos según el sistema (simple o complejo de voleibol)
  let pointsForWin, pointsForDraw, pointsForLoss;
  
  if (isVolleyballSport && customRules.scoring) {
    // Sistema de voleibol: usar el mayor valor de victoria como referencia
    // Normalmente win3_0_or_3_1 es el más alto
    pointsForWin = parseInt(customRules.scoring.win3_0_or_3_1) || 3;
    pointsForDraw = 1; // Voleibol típicamente no tiene empates
    pointsForLoss = parseInt(customRules.scoring.loss1_3_or_0_3) || 0;
  } else {
    // Sistema simple para otros deportes
    pointsForWin = customRules.points?.win || 3;
    pointsForDraw = customRules.points?.draw || 1;
    pointsForLoss = customRules.points?.loss || 0;
  }
  


  // Inicializar standings para cada equipo
  matches.forEach((match) => {
    if (!standings[match.team1]) {
      standings[match.team1] = {
        team: match.team1,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        setsFor: 0,
        setsAgainst: 0,
        points: 0,
      };
    }

    if (!standings[match.team2]) {
      standings[match.team2] = {
        team: match.team2,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        setsFor: 0,
        setsAgainst: 0,
        points: 0,
      };
    }
  });

  // Procesar los partidos completados
  matches.forEach((match) => {
    if (match.status === "completed") {
      const team1 = standings[match.team1];
      const team2 = standings[match.team2];

      team1.played++;
      team2.played++;

      if (isVolleyballSport) {
        // Lógica para voleibol (sets)
        if (match.setsTeam1 !== null && match.setsTeam2 !== null) {
          team1.setsFor += match.setsTeam1;
          team1.setsAgainst += match.setsTeam2;
          team2.setsFor += match.setsTeam2;
          team2.setsAgainst += match.setsTeam1;

          // Calcular puntos según reglas de voleibol
          const matchResult = {
            setsTeam1: match.setsTeam1,
            setsTeam2: match.setsTeam2,
            isComplete: true,
          };
          // Usar customRules del torneo si existen, sino usar sportRules por defecto
          const rulesForVolleyball = customRules && Object.keys(customRules).length > 0 ? customRules : sportRules;
          const volleyballPoints = calculateVolleyballPoints(
            matchResult,
            rulesForVolleyball
          );

          team1.points += volleyballPoints.team1Points;
          team2.points += volleyballPoints.team2Points;

          // Determinar victorias/derrotas
          if (match.setsTeam1 > match.setsTeam2) {
            team1.wins++;
            team2.losses++;
          } else if (match.setsTeam1 < match.setsTeam2) {
            team2.wins++;
            team1.losses++;
          }
        }
      } else {
        // Lógica original para otros deportes (goles)
        if (match.scoreTeam1 !== null && match.scoreTeam2 !== null) {
          team1.goalsFor += match.scoreTeam1;
          team1.goalsAgainst += match.scoreTeam2;
          team2.goalsFor += match.scoreTeam2;
          team2.goalsAgainst += match.scoreTeam1;

          if (match.scoreTeam1 > match.scoreTeam2) {
            team1.wins++;
            team1.points += pointsForWin;
            team2.losses++;
            team2.points += pointsForLoss;
          } else if (match.scoreTeam1 < match.scoreTeam2) {
            team2.wins++;
            team2.points += pointsForWin;
            team1.losses++;
            team1.points += pointsForLoss;
          } else {
            team1.draws++;
            team2.draws++;
            team1.points += pointsForDraw;
            team2.points += pointsForDraw;
          }
        }
      }
    }
  });

  // Convertir a array y ordenar
  const standingsArray = Object.values(standings);

  standingsArray.sort((a, b) => {
    // 1. Por puntos
    if (b.points !== a.points) {
      return b.points - a.points;
    }

    if (isVolleyballSport) {
      // 2. Diferencia de sets (voleibol)
      const diffA = a.setsFor - a.setsAgainst;
      const diffB = b.setsFor - b.setsAgainst;
      if (diffB !== diffA) {
        return diffB - diffA;
      }

      // 3. Sets a favor
      if (b.setsFor !== a.setsFor) {
        return b.setsFor - a.setsFor;
      }
    } else {
      // 2. Diferencia de goles (otros deportes)
      const diffA = a.goalsFor - a.goalsAgainst;
      const diffB = b.goalsFor - b.goalsAgainst;
      if (diffB !== diffA) {
        return diffB - diffA;
      }

      // 3. Goles a favor
      if (b.goalsFor !== a.goalsFor) {
        return b.goalsFor - a.goalsFor;
      }
    }

    // 4. Enfrentamiento directo (implementación básica)
    const directMatch = matches.find(
      (m) =>
        (m.team1.equals(a.team) && m.team2.equals(b.team)) ||
        (m.team1.equals(b.team) && m.team2.equals(a.team))
    );

    if (directMatch && directMatch.status === "completed") {
      if (isVolleyballSport) {
        // Comparar por sets en voleibol
        if (directMatch.team1.equals(a.team)) {
          return directMatch.setsTeam2 - directMatch.setsTeam1;
        } else {
          return directMatch.setsTeam1 - directMatch.setsTeam2;
        }
      } else {
        // Comparar por goles en otros deportes
        if (directMatch.team1.equals(a.team)) {
          return directMatch.scoreTeam2 - directMatch.scoreTeam1;
        } else {
          return directMatch.scoreTeam1 - directMatch.scoreTeam2;
        }
      }
    }

    return 0;
  });

  return standingsArray;
};

/**
 * Generates matchdays for the group stage
 * @param {Object} groupMatches - Matches grouped by group
 * @param {number} teamsPerGroup - Number of teams per group
 * @returns {Object} Object with matchdays for each group
 */
const generateMatchdays = (groupMatches, teamsPerGroup) => {
  const matchdays = {};

  // Para cada grupo
  for (const [groupName, matches] of Object.entries(groupMatches)) {
    matchdays[groupName] = [];

    if (matches.length === 0) {
      continue;
    }

    // Calcular número de equipos únicos en este grupo
    const uniqueTeams = new Set([
      ...matches.map((m) => m.team1.toString()),
      ...matches.map((m) => m.team2.toString()),
    ]);
    const numTeams = uniqueTeams.size;

    // Calcular número de jornadas necesarias para round-robin doble
    // Fórmula: Para n equipos en round-robin doble necesitamos 2(n-1) jornadas
    // Pero si n es impar, necesitamos 2n-1 jornadas para distribuir correctamente
    let totalMatchdays;
    if (numTeams % 2 === 0) {
      // Número par de equipos: 2(n-1) jornadas
      totalMatchdays = 2 * (numTeams - 1);
    } else {
      // Número impar de equipos: 2n-1 jornadas
      totalMatchdays = 2 * numTeams - 1;
    }

    // Inicializar jornadas
    for (let i = 0; i < totalMatchdays; i++) {
      matchdays[groupName][i] = [];
    }

    // Crear una copia de los partidos para procesar
    const remainingMatches = [...matches];

    // Distribuir partidos en jornadas usando algoritmo round-robin
    let currentMatchday = 0;

    while (remainingMatches.length > 0) {
      let matchAssigned = false;

      // Intentar asignar partidos en la jornada actual
      for (let i = 0; i < remainingMatches.length; i++) {
        const match = remainingMatches[i];

        // Verificar si alguno de los equipos ya juega en esta jornada
        const existingMatches = matchdays[groupName][currentMatchday];
        const teamBusy = existingMatches.some(
          (m) =>
            m.team1.equals(match.team1) ||
            m.team2.equals(match.team1) ||
            m.team1.equals(match.team2) ||
            m.team2.equals(match.team2)
        );

        if (!teamBusy) {
          // Asignar el partido a esta jornada
          matchdays[groupName][currentMatchday].push(match);
          remainingMatches.splice(i, 1);
          matchAssigned = true;
          break;
        }
      }

      // Si no se pudo asignar ningún partido más en esta jornada, pasar a la siguiente
      if (!matchAssigned) {
        currentMatchday++;

        // Verificar que no excedamos el número de jornadas
        if (currentMatchday >= totalMatchdays) {
          matchdays[groupName].push([]);
          totalMatchdays++;
        }
      }
    }

    // Limpiar jornadas vacías
    matchdays[groupName] = matchdays[groupName].filter(
      (dayMatches) => dayMatches.length > 0
    );
  }

  return matchdays;
};
