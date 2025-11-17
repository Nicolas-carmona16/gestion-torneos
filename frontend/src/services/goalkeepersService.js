/**
 * @module goalkeepersService
 * @description Service for handling goalkeepers operations (add goalkeepers to matches, get tournament goalkeepers table)
 */

import { api } from "./api.js";

/**
 * Add goalkeepers to a specific match
 * @param {string} matchId - The ID of the match
 * @param {Array} goalkeepers - Array of goalkeepers with playerId, teamId, goalsAgainst, and minutesPlayed
 * @returns {Promise<Object>} The updated match with goalkeepers
 */
export const addGoalkeepersToMatch = async (matchId, goalkeepers) => {
  try {
    const response = await api.post(
      `/matches/${matchId}/goalkeepers`,
      { goalkeepers },
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error detallado:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw new Error(
      error.response?.data?.error ||
        error.response?.data?.message ||
        "Error al agregar porteros"
    );
  }
};

/**
 * Get the goalkeepers table for a tournament
 * @param {string} tournamentId - The ID of the tournament
 * @returns {Promise<Object>} Tournament goalkeepers table with player statistics
 */
export const getTournamentGoalkeepers = async (tournamentId) => {
  try {
    const response = await api.get(`/matches/${tournamentId}/goalkeepers`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Error al obtener la tabla de porteros"
    );
  }
};

/**
 * Check if a tournament supports goalkeepers (football or futsal)
 * @param {string} sportName - The name of the sport
 * @returns {boolean} True if the sport supports goalkeepers
 */
export const isGoalkeepersSupported = (sportName) => {
  return ["Fútbol", "Fútbol Sala"].includes(sportName);
};