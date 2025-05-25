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
