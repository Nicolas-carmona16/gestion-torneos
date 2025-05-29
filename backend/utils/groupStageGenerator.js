/**
 * @file groupStageGenerator.js
 * @module utils/groupStageGenerator
 * @description This file contains the function to generate group stage matches for a tournament.
 */

import Team from "../models/teamModel.js";
import Match from "../models/matchModel.js";

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
    const matchesPerTeam = tournament.groupsStageSettings.matchesPerTeamInGroup;
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

      // Generar partidos de vuelta si es necesario
      if (matchesPerTeam > 1) {
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
export const calculateGroupStandings = (matches, tournament) => {
  const standings = {};
  const customRules = tournament.customRules || {};

  // Puntos por defecto si no hay customRules
  const pointsForWin = customRules.points?.win || 3;
  const pointsForDraw = customRules.points?.draw || 1;
  const pointsForLoss = customRules.points?.loss || 0;

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
        points: 0,
      };
    }
  });

  // Procesar los partidos completados
  matches.forEach((match) => {
    if (
      match.status === "completed" &&
      match.scoreTeam1 !== null &&
      match.scoreTeam2 !== null
    ) {
      const team1 = standings[match.team1];
      const team2 = standings[match.team2];

      team1.played++;
      team2.played++;

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
  });

  // Convertir a array y ordenar
  const standingsArray = Object.values(standings);

  standingsArray.sort((a, b) => {
    // 1. Por puntos
    if (b.points !== a.points) {
      return b.points - a.points;
    }

    // 2. Diferencia de goles
    const diffA = a.goalsFor - a.goalsAgainst;
    const diffB = b.goalsFor - b.goalsAgainst;
    if (diffB !== diffA) {
      return diffB - diffA;
    }

    // 3. Goles a favor
    if (b.goalsFor !== a.goalsFor) {
      return b.goalsFor - a.goalsFor;
    }

    // 4. Enfrentamiento directo (implementación básica)
    const directMatch = matches.find(
      (m) =>
        (m.team1.equals(a.team) && m.team2.equals(b.team)) ||
        (m.team1.equals(b.team) && m.team2.equals(a.team))
    );

    if (directMatch && directMatch.status === "completed") {
      if (directMatch.team1.equals(a.team)) {
        return directMatch.scoreTeam2 - directMatch.scoreTeam1;
      } else {
        return directMatch.scoreTeam1 - directMatch.scoreTeam2;
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

    // Calcular número de jornadas necesarias
    const numTeams =
      matches.length > 0
        ? new Set([
            ...matches.map((m) => m.team1),
            ...matches.map((m) => m.team2),
          ]).size
        : 0;

    const matchesPerTeam = numTeams - 1; // Round-robin simple
    const totalMatchdays = matchesPerTeam * 2; // Ida y vuelta

    // Distribuir partidos en jornadas
    for (let i = 0; i < totalMatchdays; i++) {
      matchdays[groupName][i] = [];
    }

    matches.forEach((match) => {
      // Encontrar la primera jornada disponible para este partido
      let matchday = 0;
      while (matchday < totalMatchdays) {
        const existingMatches = matchdays[groupName][matchday];

        // Verificar si alguno de los equipos ya juega en esta jornada
        const teamBusy = existingMatches.some(
          (m) =>
            m.team1.equals(match.team1) ||
            m.team2.equals(match.team1) ||
            m.team1.equals(match.team2) ||
            m.team2.equals(match.team2)
        );

        if (!teamBusy) {
          matchdays[groupName][matchday].push(match);
          break;
        }

        matchday++;
      }
    });
  }

  return matchdays;
};
