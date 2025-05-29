import { api } from "./api";

export const createGroupStage = async (tournamentId) => {
  try {
    const response = await api.post(
      `/matches/${tournamentId}/groups`,
      { tournamentId },
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error generando fase de grupos:", error);
    throw error;
  }
};

export const getTournamentMatches = async (tournamentId) => {
  try {
    const response = await api.get(`/matches/${tournamentId}/matches`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error obteniendo partidos del torneo:", error);
    throw error;
  }
};

export const getGroupStandings = async (tournamentId) => {
  try {
    const response = await api.get(`/matches/${tournamentId}/standings`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error obteniendo tabla de posiciones:", error);
    throw error;
  }
};

export const updateMatchResult = async (matchId, matchData) => {
  try {
    const response = await api.put(`/matches/${matchId}`, matchData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error actualizando resultado:", error);
    throw error;
  }
};

export const getMatchesByMatchday = async (tournamentId) => {
  try {
    const response = await api.get(`/matches/${tournamentId}/matchdays`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error obteniendo partidos por jornada:", error);
    throw error;
  }
};

export const getSingleMatchday = async (tournamentId, matchday) => {
  try {
    const response = await api.get(
      `/matches/${tournamentId}/matchdays/${matchday}`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error obteniendo jornada específica:", error);
    throw error;
  }
};
