export const statusMapping = (status) => {
  switch (status) {
    case "pending":
      return "Pendiente";
    case "registration":
      return "En registro";
    case "active":
      return "Activo";
    case "finished":
      return "Finalizado";
    default:
      return status;
  }
};
