import { api } from "./api";

/**
 * Obtiene los IDs de los equipos comodines (wildcards) para un torneo
 * @param {string} tournamentId - ID del torneo
 * @returns {Promise<Array<string>>} Array de IDs de equipos comodines
 */
export const getWildcardTeams = async (tournamentId) => {
  try {
    const response = await api.get(`/tournaments/${tournamentId}/wildcards`);
    return response.data;
  } catch (error) {
    console.error("Error obteniendo comodines:", error);
    return [];
  }
};
