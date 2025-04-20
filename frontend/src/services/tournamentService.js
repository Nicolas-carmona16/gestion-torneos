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

export const createTournament = async (tournamentData) => {
  try {
    const response = await api.post("/tournaments", tournamentData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error creando el torneo:", error);
    throw error;
  }
};

export const deleteTournament = async (id) => {
  try {
    const response = await api.delete(`/tournaments/${id}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error eliminando torneo:", error);
    throw error;
  }
};

export const updateTournament = async (id, tournamentData) => {
  try {
    const response = await api.put(`/tournaments/${id}`, tournamentData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error actualizando torneo:", error);
    throw error;
  }
};
