/**
 * @fileoverview Service for fetching admin statistics from API
 * @module services/statisticsService
 */

import { api } from "./api";

/**
 * Get general dashboard statistics
 * @returns {Promise<Object>} Dashboard statistics
 */
export const getDashboardStats = async () => {
  try {
    const response = await api.get("/statistics/dashboard", {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard statistics:", error);
    throw error;
  }
};

/**
 * Get detailed tournament statistics
 * @returns {Promise<Object>} Tournament statistics
 */
export const getTournamentStats = async () => {
  try {
    const response = await api.get("/statistics/tournaments", {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching tournament statistics:", error);
    throw error;
  }
};

/**
 * Get participation statistics (teams and players)
 * @returns {Promise<Object>} Participation statistics
 */
export const getParticipationStats = async () => {
  try {
    const response = await api.get("/statistics/participation", {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching participation statistics:", error);
    throw error;
  }
};

/**
 * Get sports and match statistics
 * @returns {Promise<Object>} Sports statistics
 */
export const getSportsStats = async () => {
  try {
    const response = await api.get("/statistics/sports", {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching sports statistics:", error);
    throw error;
  }
};

/**
 * Get activity and changelog statistics
 * @returns {Promise<Object>} Activity statistics
 */
export const getActivityStats = async () => {
  try {
    const response = await api.get("/statistics/activity", {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching activity statistics:", error);
    throw error;
  }
};
