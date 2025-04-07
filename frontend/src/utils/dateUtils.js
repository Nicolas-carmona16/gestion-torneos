/**
 * @module dateUtils
 * @description Utility functions related to date formatting.
 */

/**
 * @function formatBirthDate
 * @description Formats a birth date string into a human-readable format (dd/mm/yyyy) using the "es-ES" locale.
 *
 * @param {string} dateString - The birth date as a string (ISO format recommended).
 * @returns {string} The formatted date string in dd/mm/yyyy format.
 */

export const formatBirthDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
};
