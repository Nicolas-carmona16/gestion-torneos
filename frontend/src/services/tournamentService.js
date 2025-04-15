import { api } from "./api";

export const getAllTournaments = async () => {
  try {
    const response = await api.get("/tournaments", {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error obteniendo todos los torneos:", error);
    throw error;
  }
};

export const getTournamentById = async (id) => {
  try {
    const response = await api.get(`tournaments/${id}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error obteniendo torneo por ID:", error);
    throw error;
  }
};
