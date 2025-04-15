/**
 * Determines the current status of a tournament based on its dates.
 *
 * @param {Object} tournament - The tournament object containing date fields.
 * @param {string} tournament.registrationStart - The start date for registration.
 * @param {string} tournament.registrationEnd - The end date for registration.
 * @param {string} tournament.startDate - The start date of the tournament.
 * @param {string} tournament.endDate - The end date of the tournament.
 * @returns {string} - The current status of the tournament. Possible values:
 * - "pending"
 * - "registration"
 * - "active"
 * - "finished"
 *
 * @example
 * const status = calculateTournamentStatus(tournament);
 */
export const calculateTournamentStatus = (tournament) => {
  const now = new Date();
  const regStart = new Date(tournament.registrationStart);
  const regEnd = new Date(tournament.registrationEnd);
  const start = new Date(tournament.startDate);
  const end = new Date(tournament.endDate);

  if (now < regStart) {
    return "pending";
  }
  if (now >= regStart && now < regEnd) {
    return "registration";
  }
  if (now >= regEnd && now < start) {
    return "pending";
  }
  if (now >= start && now < end) {
    return "active";
  }
  return "finished";
};
