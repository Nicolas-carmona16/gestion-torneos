import { api } from "./api";

export const createEliminationBracket = async (tournamentId) => {
  try {
    const response = await api.post(
      `/matches/${tournamentId}/elimination`,
      { tournamentId },
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error generando bracket de eliminación:", error);
    throw error;
  }
};

export const getEliminationBracket = async (tournamentId) => {
  try {
    const response = await api.get(`/matches/${tournamentId}/bracket`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error obteniendo bracket:", error);
    throw error;
  }
};
