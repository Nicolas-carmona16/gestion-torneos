import { api } from "./api";

export const registerUser = async (userData) => {
  const response = await api.post("/users/register", userData, {
    withCredentials: true,
  });
  return response.data;
};

export const loginUser = async (userData) => {
  const response = await api.post("/users/login", userData, {
    withCredentials: true,
  });
  return response.data;
};

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

export const logoutUser = async () => {
  try {
    await api.post("/users/logout", {}, { withCredentials: true });
  } catch (error) {
    console.error("Error cerrando sesión:", error);
  }
};

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
