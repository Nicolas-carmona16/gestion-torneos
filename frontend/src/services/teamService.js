import { api } from "./api";

export const registerTeam = async (teamData, files) => {
  try {
    const formData = new FormData();
    formData.append("name", teamData.name);
    formData.append("tournamentId", teamData.tournamentId);
    formData.append("captainExtra[idNumber]", teamData.captainExtra.idNumber);
    formData.append("captainExtra[career]", teamData.captainExtra.career);
    formData.append("captainExtra[eps]", "EPS del capitán");
    if (files.captainEPS) {
      formData.append("captainEPS", files.captainEPS);
    }

    teamData.players.forEach((player, index) => {
      formData.append(`players[${index}][fullName]`, player.fullName);
      formData.append(`players[${index}][idNumber]`, player.idNumber);
      formData.append(`players[${index}][email]`, player.email);
      formData.append(`players[${index}][career]`, player.career);

      if (files.playersEPS && files.playersEPS[index]) {
        formData.append("playersEPS", files.playersEPS[index]);
      }
    });

    const response = await api.post("/teams/register", formData, {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
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

export const addPlayersToTeam = async (teamId, newPlayers, epsFile) => {
  try {
    const formData = new FormData();
    formData.append("teamId", teamId);
    formData.append("newPlayers[0][fullName]", newPlayers.fullName);
    formData.append("newPlayers[0][idNumber]", newPlayers.idNumber);
    formData.append("newPlayers[0][email]", newPlayers.email);
    formData.append("newPlayers[0][career]", newPlayers.career);

    if (epsFile) {
      formData.append("playerEPS", epsFile);
    }

    const response = await api.post("/teams/add-players", formData, {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding players:", error);
    throw error;
  }
};

export const getTeamPlayers = async (teamId) => {
  try {
    const response = await api.get(`/teams/${teamId}`, {
      withCredentials: true,
    });
    return response.data.team.players;
  } catch (error) {
    console.error("Error getting team players:", error);
    throw error;
  }
};
