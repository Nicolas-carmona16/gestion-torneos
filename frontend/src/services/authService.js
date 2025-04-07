/**
 * @module authService
 * @description Service functions for handling user authentication and user management via the API.
 */

import { api } from "./api";

/**
 * Registers a new user.
 * @async
 * @function
 * @param {Object} userData - New user data.
 * @returns {Promise<Object>} The registered user data.
 */
export const registerUser = async (userData) => {
  const response = await api.post("/users/register", userData, {
    withCredentials: true,
  });
  return response.data;
};

/**
 * Logs in a user.
 * @async
 * @function
 * @param {Object} userData - Login credentials.
 * @returns {Promise<Object>} Logged in user data.
 */
export const loginUser = async (userData) => {
  const response = await api.post("/users/login", userData, {
    withCredentials: true,
  });
  return response.data;
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
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.warn("Usuario no autenticado");
      return null;
    }
    console.error("Error fetching user data:", error);
    return null;
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
    return response.data;
  } catch (error) {
    console.error("Error obteniendo todos los usuarios:", error);
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
 * Updates user information by ID.
 * @async
 * @function
 * @param {string} userId - The ID of the user to update.
 * @param {Object} userData - The updated user data.
 * @returns {Promise<Object>} The updated user data.
 * @throws Will throw an error if the request fails.
 */
export const updateUser = async (userId, userData) => {
  try {
    const response = await api.put(`/users/${userId}`, userData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error actualizando usuario:", error);
    throw error;
  }
};
