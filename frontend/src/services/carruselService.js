/**
 * @module carruselService
 * @description Service functions for managing carousel images via the API.
 */

import { api } from "./api";

/**
 * Fetches all carousel images from the server
 * @async
 * @function
 * @returns {Promise<Array>} Array of carousel image objects
 */
export const getCarouselImages = async () => {
  try {
    const response = await api.get("/carrusel");
    return response.data;
  } catch (error) {
    console.error("Error fetching carousel images:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Uploads a new image to the carousel
 * @async
 * @function
 * @param {File} imageFile - The image file to upload
 * @returns {Promise<Object>} Upload response with image data
 */
export const uploadCarouselImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await api.post("/carrusel/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading carousel image:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Deletes a carousel image
 * @async
 * @function
 * @param {string} imageName - Name of the image to delete
 * @returns {Promise<Object>} Delete response
 */
export const deleteCarouselImage = async (imageName) => {
  try {
    const response = await api.delete(`/carrusel/${imageName}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting carousel image:", error.response?.data || error.message);
    throw error;
  }
};
