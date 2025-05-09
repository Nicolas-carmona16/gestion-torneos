import { api } from "./api";

export const registerTeam = async (teamData) => {
  try {
    const response = await api.post("/teams/register", teamData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error registering team:", error);
    throw error;
  }
};

export const getTeamById = async (id) => {
  try {
    const response = await api.get(`/teams/${id}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error getting team:", error);
    throw error;
  }
};

export const getTeamsByTournament = async (tournamentId) => {
  try {
    const response = await api.get(`/teams/tournament/${tournamentId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error getting teams by tournament:", error);
    throw error;
  }
};

export const removePlayerFromTeam = async (teamId, playerId) => {
  try {
    const response = await api.post(
      "/teams/remove-player",
      { teamId, playerId },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("Error removing player:", error);
    throw error;
  }
};

export const addPlayersToTeam = async (teamId, newPlayers) => {
  try {
    const response = await api.post(
      "/teams/add-players",
      { teamId, newPlayers },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding players:", error);
    throw error;
  }
};
