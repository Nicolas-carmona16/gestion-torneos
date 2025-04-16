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
