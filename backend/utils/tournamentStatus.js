/**
 * Determines the current status of a tournament based on its dates.
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
  const regStart = new Date(tournament.registrationStart);
  const regTeamEnd = new Date(tournament.registrationTeamEnd);
  const regPlayerEnd = new Date(tournament.registrationPlayerEnd);
  const start = new Date(tournament.startDate);
  const end = new Date(tournament.endDate);

  if (now < regStart) {
    return "coming soon";
  }
  if (now >= regStart && now < regTeamEnd) {
    return "registration open";
  }
  if (now >= regTeamEnd && now < regPlayerEnd && now < start) { 
    return "player adjustment";
  }
  if (now >= regPlayerEnd && now < start) {
    return "preparation";
  }
  if (now >= start && now < end) {
    return "in progress";
  }
  return "completed";
};
