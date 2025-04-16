import { api } from "./api";

export const getAllSports = async () => {
  try {
    const response = await api.get("/sports", {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getSportRules = async (sportId) => {
  try {
    const response = await api.get(`/sports/${sportId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error obteniendo las reglas del deporte:", error);
    throw error;
  }
};
