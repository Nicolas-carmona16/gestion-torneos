/**
 * @module scorersService
 * @description Service for handling scorers operations (add scorers to matches, get tournament scorers table)
 */

import { api } from "./api.js";

/**
 * Add scorers to a specific match
 * @param {string} matchId - The ID of the match
 * @param {Array} scorers - Array of scorers with playerId, teamId, and goals
 * @returns {Promise<Object>} The updated match with scorers
 */
// scorersService.js
export const addScorersToMatch = async (matchId, scorers) => {
  try {
    const response = await api.post(
      `/matches/${matchId}/scorers`,
      { scorers },
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
        "Error al agregar goleadores"
    );
  }
};

/**
 * Get the scorers table for a tournament
 * @param {string} tournamentId - The ID of the tournament
 * @returns {Promise<Object>} Tournament scorers table with player statistics
 */
export const getTournamentScorers = async (tournamentId) => {
  try {
    const response = await api.get(`/matches/${tournamentId}/scorers`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Error al obtener la tabla de goleadores"
    );
  }
};

/**
 * Check if a tournament supports scorers (football or futsal)
 * @param {string} sportName - The name of the sport
 * @returns {boolean} True if the sport supports scorers
 */
export const isScorersSupported = (sportName) => {
  return ["Fútbol", "Fútbol Sala"].includes(sportName);
};
