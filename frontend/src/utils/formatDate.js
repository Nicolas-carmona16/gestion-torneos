export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  
  const date = new Date(dateString);
  
  // Para fechas que se guardaron como medianoche UTC (fechas de torneos),
  // queremos mostrar el día que realmente se quiso representar
  // Usar los valores UTC directamente para evitar conversión de zona horaria
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  
  return `${day}/${month}/${year}`;
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
