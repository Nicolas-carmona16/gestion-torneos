/**
 * @file dateUtils.js
 * @module utils/dateUtils
 * @description Utilidades para el manejo correcto de fechas considerando la zona horaria local de Colombia
 */

/**
 * Obtiene la fecha actual en Colombia (sin hora)
 * @returns {Date} Fecha actual en Colombia como objeto Date
 */
export const getNowInColombia = () => {
  const now = new Date();
  const colombiaTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Bogota" }));
  // Establecer la hora a medianoche para comparaciones de solo fecha
  colombiaTime.setHours(0, 0, 0, 0);
  return colombiaTime;
};

/**
 * Convierte una fecha UTC a fecha local (Colombia) sin conversión de zona horaria
 * @param {string|Date} utcDate - Fecha en formato UTC
 * @returns {Date} - Fecha interpretada como local
 */
export const getDateFromUTC = (utcDate) => {
  const date = new Date(utcDate);
  // Crear nueva fecha usando los componentes UTC como si fueran locales
  const localDate = new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  );
  return localDate;
};

/**
 * Compara fechas considerando solo el día, no la hora exacta
 * Útil para comparar fechas de registro de torneos
 * @param {string|Date} date1 - Primera fecha
 * @param {string|Date} date2 - Segunda fecha  
 * @returns {number} -1 si date1 < date2, 0 si son iguales, 1 si date1 > date2
 */
export const compareDatesOnly = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  // Resetear horas para comparar solo fechas
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  
  if (d1.getTime() < d2.getTime()) return -1;
  if (d1.getTime() > d2.getTime()) return 1;
  return 0;
};



/**
 * Verifica si hoy está dentro del período de registro de equipos
 * @param {string|Date} registrationStart - Fecha de inicio del registro
 * @param {string|Date} registrationTeamEnd - Fecha de fin del registro de equipos
 * @returns {boolean} true si el registro está abierto hoy
 */
export const isTeamRegistrationOpen = (registrationStart, registrationTeamEnd) => {
  const now = getNowInColombia();
  const start = getDateFromUTC(registrationStart);
  const end = getDateFromUTC(registrationTeamEnd);
  
  // Configurar horas para comparación
  start.setHours(0, 0, 0, 0); // Inicio del día
  end.setHours(23, 59, 59, 999); // Final del día
  
  return now >= start && now <= end;
};

/**
 * Formatea una fecha en formato DD/MM/YYYY sin conversión de zona horaria
 * Útil para mostrar fechas en correos electrónicos y reportes
 * @param {string|Date} dateValue - Fecha a formatear
 * @returns {string} Fecha formateada como DD/MM/YYYY o 'No definida' si es null/undefined
 */
export const formatDate = (dateValue) => {
  if (!dateValue) return 'No definida';
  const date = new Date(dateValue);
  // Usar métodos UTC para evitar conversiones de zona horaria
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
};