/**
 * @module authService
 * @description Service functions for handling user authentication and user management via the API.
 */

import { api } from "./api";

/**
 * Logs in a user and returns complete profile with sports/tournaments.
 * @async
 * @function
 * @param {Object} userData - Login credentials.
 * @param {string} userData.email
 * @param {string} userData.password
 * @returns {Promise<Object>} Logged in user data with populated associations.
 */
export const loginUser = async ({ email, password }) => {
  try {
    const response = await api.post(
      "/users/login",
      { email, password },
      {
        withCredentials: true,
      }
    );
    return {
      ...response.data,
      sports: Array.isArray(response.data.sports) ? response.data.sports : [],
      tournaments: Array.isArray(response.data.tournaments)
        ? response.data.tournaments
        : [],
    };
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Fetches the currently authenticated user's profile.
 * @async
 * @function
 * @returns {Promise<Object|null>} User profile data or null if unauthenticated.
 */
export const getUser = async () => {
  try {
    const response = await api.get("/users/profile", { withCredentials: true });
    return {
      ...response.data,
      sports: response.data.sports || [],
      tournaments: response.data.tournaments || [],
    };
  } catch (error) {
    if (error.response?.status === 401) {
      console.warn("User not authenticated");
      return null;
    }
    console.error(
      "Error fetching user:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Logs out the currently authenticated user.
 * @async
 * @function
 * @returns {Promise<void>}
 */
export const logoutUser = async () => {
  try {
    await api.post("/users/logout", {}, { withCredentials: true });
  } catch (error) {
    console.error("Error cerrando sesión:", error);
  }
};

/**
 * Retrieves a list of all users (admin-only).
 * @async
 * @function
 * @returns {Promise<Array<Object>>} List of users.
 * @throws Will throw an error if the request fails.
 */
export const getAllUsers = async () => {
  try {
    const response = await api.get("/users/all-users", {
      withCredentials: true,
    });
    return response.data.map((user) => ({
      ...user,
      sports: user.sports || [],
      tournaments: user.tournaments || [],
    }));
  } catch (error) {
    console.error(
      "Error fetching users:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Deletes a user by ID.
 * @async
 * @function
 * @param {string} userId - The ID of the user to delete.
 * @returns {Promise<Object>} The deleted user's data.
 * @throws Will throw an error if the request fails.
 */
export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/users/${userId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error eliminando usuario:", error);
    throw error;
  }
};

/**
 * Updates user information including sports/tournaments associations.
 * @async
 * @function
 * @param {string} userId - ID of user to update
 * @param {Object} userData - Data to update
 * @param {Array<string>} [userData.sports] - Array of sport IDs
 * @param {Array<string>} [userData.tournaments] - Array of tournament IDs
 * @returns {Promise<Object>} Updated user data with populated associations
 */
export const updateUser = async (userId, userData) => {
  try {
    const payload = {
      ...userData,
      sports: userData.sports ?? undefined,
      tournaments: userData.tournaments ?? undefined,
    };

    const response = await api.put(`/users/${userId}`, payload, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Update error:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Creates a new user (Admin only)
 * @async
 * @function
 * @param {Object} userData - User data
 * @param {string} userData.firstName
 * @param {string} userData.lastName
 * @param {string} userData.email
 * @param {string} userData.password
 * @param {string} [userData.role="player"]
 * @param {Array<string>} [userData.sports=[]] - Array of sport IDs
 * @param {Array<string>} [userData.tournaments=[]] - Array of tournament IDs
 * @returns {Promise<Object>} Created user data with populated associations
 */
export const createUser = async (userData) => {
  try {
    const response = await api.post(
      "/users/admin-create",
      {
        ...userData,
        sports: userData.sports || [],
        tournaments: userData.tournaments || [],
      },
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Create user error:", error.response?.data || error.message);
    throw error;
  }
};
