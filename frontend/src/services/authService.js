import { api } from "./api";

export const registerUser = async (userData) => {
  const response = await api.post("/users/register", userData, {
    withCredentials: true,
  });
  return response.data;
};
