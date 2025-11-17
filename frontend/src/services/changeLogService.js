/**
 * @module changeLogService
 * @description Service functions for handling team change logs (novedades) via the API.
 */

import { api } from "./api";

/**
 * Fetches all team change logs with optional filters.
 * @async
 * @function
 * @param {Object} filters - Optional filters
 * @param {string} [filters.tournament] - Tournament ID to filter by
 * @param {string} [filters.team] - Team ID to filter by
 * @returns {Promise<Array<Object>>} List of change logs
 */
export const getAllChangeLogs = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.tournament) params.append("tournament", filters.tournament);
    if (filters.team) params.append("team", filters.team);

    const response = await api.get(`/changelog?${params.toString()}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching change logs:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Fetches unread change logs for the current admin.
 * @async
 * @function
 * @returns {Promise<Object>} Object with count and changes array
 */
export const getUnreadChangeLogs = async () => {
  try {
    const response = await api.get("/changelog/unread", {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching unread changes:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Marks a specific change log as read.
 * @async
 * @function
 * @param {string} changeId - The ID of the change log to mark as read
 * @returns {Promise<Object>} Updated change log
 */
export const markChangeAsRead = async (changeId) => {
  try {
    const response = await api.patch(
      `/changelog/${changeId}/read`,
      {},
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error marking as read:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Marks all unread change logs as read.
 * @async
 * @function
 * @returns {Promise<Object>} Object with modifiedCount
 */
export const markAllChangesAsRead = async () => {
  try {
    const response = await api.patch(
      "/changelog/read-all",
      {},
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error marking all as read:",
      error.response?.data || error.message
    );
    throw error;
  }
};
