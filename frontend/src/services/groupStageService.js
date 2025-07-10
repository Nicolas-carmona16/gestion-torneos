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

export const getGroupStandings = async (tournamentId) => {
  try {
    const response = await api.get(`/matches/${tournamentId}/standings`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error obteniendo posiciones:", error);
    throw error;
  }
};

export const createPlayoffBracket = async (tournamentId) => {
  try {
    const response = await api.post(
      `/matches/${tournamentId}/playoff`,
      {},
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error generando playoff:", error);
    throw error;
  }
};

export const checkPlayoffStatus = async (tournamentId) => {
  try {
    const response = await api.get(`/matches/${tournamentId}/playoff/status`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error verificando estado del playoff:", error);
    throw error;
  }
};

export const checkGroupStageCompletion = async (tournamentId) => {
  try {
    const response = await api.get(`/matches/${tournamentId}/matchdays`, {
      withCredentials: true,
    });
    
    const matchesByMatchday = response.data;
    const allMatches = Object.values(matchesByMatchday).flat();
    
    const totalMatches = allMatches.length;
    const completedMatches = allMatches.filter(match => match.status === "completed").length;
    
    return {
      isComplete: totalMatches > 0 && totalMatches === completedMatches,
      totalMatches,
      completedMatches,
      completionPercentage: totalMatches > 0 ? (completedMatches / totalMatches) * 100 : 0
    };
  } catch (error) {
    console.error("Error verificando completación de fase de grupos:", error);
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

export const updateMatchResult = async (matchId, updateData) => {
  try {
    const response = await api.put(`/matches/${matchId}`, updateData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error actualizando partido:", error);
    throw error;
  }
};

export const getSingleMatchday = async (tournamentId, matchday) => {
  try {
    const response = await api.get(`/matches/${tournamentId}/matchdays/${matchday}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error obteniendo jornada específica:", error);
    throw error;
  }
};
