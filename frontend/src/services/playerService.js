/**
 * @fileoverview Service functions for handling player-related API calls.
 * @module services/playerService
 */

import { api } from "./api.js";

/**
 * @function getAllPlayers
 * @desc Get all players from the API
 * @returns {Promise<Array>} Array of players
 */
export const getAllPlayers = async () => {
  try {
    const response = await api.get("/players", {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching players:", error);
    throw error;
  }
};

/**
 * @function downloadPlayersExcel
 * @desc Download players data as Excel file
 * @returns {Promise<Blob>} Excel file as blob
 */
export const downloadPlayersExcel = async () => {
  try {
    const response = await api.get("/players/download-excel", {
      responseType: "blob",
      withCredentials: true,
    });

    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `jugadores_${new Date().toISOString().split("T")[0]}.xlsx`;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return blob;
  } catch (error) {
    console.error("Error downloading players Excel:", error);
    throw error;
  }
};
