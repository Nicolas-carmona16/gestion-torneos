import { getDateFromUTC } from './dateUtils.js';

/**
 * Determines the current status of a tournament based on its dates.
 * Uses Colombian timezone to avoid date interpretation issues.
 *
 * @param {Object} tournament - The tournament object containing date fields.
 * @param {string} tournament.registrationStart - The start date for registration.
 * @param {string} tournament.registrationTeamEnd - The end date for team registration.
 * @param {string} tournament.registrationPlayerEnd - The end date for player registration.
 * @param {string} tournament.startDate - The start date of the tournament.
 * @param {string} tournament.endDate - The end date of the tournament.
 * @returns {string} - The current status of the tournament. Possible values:
 * - "coming soon"
 * - "registration open"
 * - "player adjustment"
 * - "preparation"
 * - "in progress"
 * - "completed"
 *
 * @example
 * const status = calculateTournamentStatus(tournament);
 */
export const calculateTournamentStatus = (tournament) => {
  const now = new Date();
  
  const regStart = getDateFromUTC(tournament.registrationStart);
  const regTeamEnd = getDateFromUTC(tournament.registrationTeamEnd);
  const regPlayerEnd = getDateFromUTC(tournament.registrationPlayerEnd);
  const start = getDateFromUTC(tournament.startDate);
  const end = getDateFromUTC(tournament.endDate);

  // Configurar horas para comparación
  now.setHours(12, 0, 0, 0); // Usar mediodía para evitar problemas de borde
  regStart.setHours(0, 0, 0, 0);
  regTeamEnd.setHours(23, 59, 59, 999); // Final del día
  regPlayerEnd.setHours(23, 59, 59, 999); // Final del día
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999); // Final del día

  if (now < regStart) {
    return "coming soon";
  }
  if (now >= regStart && now <= regTeamEnd) {
    return "registration open";
  }
  if (now > regTeamEnd && now <= regPlayerEnd && now < start) { 
    return "player adjustment";
  }
  if (now > regPlayerEnd && now < start) {
    return "preparation";
  }
  if (now >= start && now <= end) {
    return "in progress";
  }
  return "completed";
};
