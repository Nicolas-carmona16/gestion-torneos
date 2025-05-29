export const translateRoundName = (roundName) => {
  switch (roundName) {
    case "round-of-32":
      return "Dieciseisavos de Final";
    case "round-of-16":
      return "Octavos de Final";
    case "quarter-finals":
      return "Cuartos de Final";
    case "semi-finals":
      return "Semifinales";
    case "final":
      return "Final";
    default:
      return roundName;
  }
};

export const translateStatus = (status) => {
  switch (status) {
    case "scheduled":
      return "Programado";
    case "pending":
      return "Pendiente";
    case "in-progress":
      return "En progreso";
    case "completed":
      return "Completado";
    case "postponed":
      return "Aplazado";
    case "cancelled":
      return "Cancelado";
    case "walkover":
      return "Walkover";
    default:
      return status;
  }
};
