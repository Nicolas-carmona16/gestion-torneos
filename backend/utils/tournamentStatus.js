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
