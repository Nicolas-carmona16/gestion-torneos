export const statusMapping = (status) => {
  switch (status) {
    case "coming soon":
      return "Proximamente";
    case "registration open":
      return "Registro Abierto";
    case "player adjustment":
      return "Ajuste de Jugadores";
    case "preparation":
      return "Preparacion";
    case "in progress":
      return "En Progreso";
    case "completed":
      return "Finalizado";
    default:
      return status;
  }
};

export const calculateTournamentStatus = (tournament) => {
  const now = new Date();
  const dates = {
    regStart: new Date(tournament.registrationStart),
    regTeamEnd: new Date(tournament.registrationTeamEnd),
    regPlayerEnd: new Date(tournament.registrationPlayerEnd),
    start: new Date(tournament.startDate),
    end: new Date(tournament.endDate),
  };

  if (now < dates.regStart) return "coming soon";
  if (now >= dates.regStart && now < dates.regTeamEnd)
    return "registration open";
  if (now >= dates.regTeamEnd && now < dates.regPlayerEnd && now < dates.start)
    return "player adjustment";
  if (now >= dates.regPlayerEnd && now < dates.start) return "preparation";
  if (now >= dates.start && now < dates.end) return "in progress";
  return "completed";
};
