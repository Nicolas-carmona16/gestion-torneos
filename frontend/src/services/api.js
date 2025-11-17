/**
 * @module api
 * @description Axios instance configured for communicating with the backend API.
 */

import axios from "axios";

/**
 * @constant {string} API_URL
 * @description The base URL for the backend API. Defaults to localhost if not set in environment variables.
 */
const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

/**
 * @constant {Object} api
 * @description Axios instance with default base URL and JSON headers.
 */
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});
