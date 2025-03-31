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
