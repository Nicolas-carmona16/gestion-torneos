export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("es-ES", {
    timeZone: "UTC",
  });
};

export const formatTimeTo12h = (timeString) => {
  if (!timeString) return "Por definir";

  try {
    const [hours, minutes] = timeString.split(":");
    const hourNum = parseInt(hours, 10);
    const period = hourNum >= 12 ? "PM" : "AM";
    const hour12 = hourNum % 12 || 12;

    return `${hour12}:${minutes} ${period}`;
  } catch (error) {
    console.error("Error formateando hora:", error);
    return timeString;
  }
};
