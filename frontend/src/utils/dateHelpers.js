/**
 * @file dateHelpers.js
 * @description Utilidades para manejo consistente de fechas en zona horaria de Colombia
 */

/**
 * Convierte una fecha UTC a fecha local para campos de input date
 * El objetivo es que si guardamos "1 de octubre", el input muestre "1 de octubre"
 * @param {string} dateString - Fecha en formato ISO (UTC)
 * @returns {string} Fecha en formato YYYY-MM-DD (local)
 */
export const utcToLocalDateString = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // Si la fecha viene como medianoche UTC (2025-10-01T00:00:00.000Z)
  // queremos mantener el día 1, no convertir a día anterior por zona horaria
  // Usamos toLocaleDateString para obtener la fecha que realmente se quiso representar
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Convierte una fecha de input date (YYYY-MM-DD) a formato UTC para enviar al backend
 * @param {string} dateString - Fecha en formato YYYY-MM-DD
 * @returns {string} Fecha en formato ISO UTC (manteniendo el día)
 */
export const localDateStringToUTC = (dateString) => {
  if (!dateString) return '';
  
  // Crear fecha UTC manteniendo el día especificado
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  
  return date.toISOString();
};

/**
 * Convierte fecha UTC de base de datos a fecha local para mostrar
 * @param {string} dateString - Fecha UTC de la base de datos
 * @returns {string} Fecha formateada para mostrar al usuario
 */
export const formatDateForDisplay = (dateString) => {
  if (!dateString) return "N/A";
  
  const date = new Date(dateString);
  // Usar toLocaleDateString con zona horaria explícita
  return date.toLocaleDateString("es-CO", {
    timeZone: "America/Bogota",
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

/**
 * Prepara fechas para enviar al backend (desde formulario)
 * @param {Object} formData - Datos del formulario
 * @returns {Object} Datos con fechas convertidas correctamente
 */
export const prepareDatesForBackend = (formData) => {
  const dateFields = [
    'registrationStart',
    'registrationTeamEnd', 
    'registrationPlayerEnd',
    'startDate',
    'endDate'
  ];
  
  const processedData = { ...formData };
  
  dateFields.forEach(field => {
    if (processedData[field]) {
      // Si la fecha viene como YYYY-MM-DD, convertir a UTC manteniendo el día
      if (typeof processedData[field] === 'string' && 
          processedData[field].match(/^\d{4}-\d{2}-\d{2}$/)) {
        processedData[field] = localDateStringToUTC(processedData[field]);
      }
    }
  });
  
  return processedData;
};

/**
 * Prepara fechas para mostrar en formulario de edición
 * @param {Object} tournament - Datos del torneo desde la base de datos
 * @returns {Object} Datos con fechas preparadas para inputs date
 */
export const prepareDatesForEdit = (tournament) => {
  const dateFields = [
    'registrationStart',
    'registrationTeamEnd',
    'registrationPlayerEnd', 
    'startDate',
    'endDate'
  ];
  
  const processedData = { ...tournament };
  
  dateFields.forEach(field => {
    if (processedData[field]) {
      processedData[field] = utcToLocalDateString(processedData[field]);
    }
  });
  
  return processedData;
};

/**
 * Obtiene la fecha actual en Colombia (sin hora)
 * @returns {Date} - Fecha actual en Colombia como objeto Date
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
 * Verifica si el registro de equipos está abierto para un torneo
 * @param {Object} tournament - Objeto torneo con fechas de registro
 * @returns {boolean} - true si el registro está abierto
 */
export const isTeamRegistrationOpen = (tournament) => {
  if (!tournament || !tournament.registrationStart || !tournament.registrationTeamEnd) {
    return false;
  }

  const now = getNowInColombia();
  const registrationStart = getDateFromUTC(tournament.registrationStart);
  const registrationEnd = getDateFromUTC(tournament.registrationTeamEnd);

  return now >= registrationStart && now <= registrationEnd;
};

/**
 * Verifica si la modificación de jugadores está permitida para un torneo
 * @param {Object} tournament - Objeto torneo con fechas de registro
 * @returns {boolean} - true si se pueden modificar jugadores
 */
export const canModifyPlayers = (tournament) => {
  if (!tournament || !tournament.registrationPlayerEnd) {
    return false;
  }

  const now = getNowInColombia();
  const registrationEnd = getDateFromUTC(tournament.registrationPlayerEnd);

  return now <= registrationEnd;
};

/**
 * Compara dos fechas ignorando la zona horaria
 * @param {string|Date} date1 - Primera fecha
 * @param {string|Date} date2 - Segunda fecha  
 * @returns {number} - -1 si date1 < date2, 0 si son iguales, 1 si date1 > date2
 */
export const compareDatesOnly = (date1, date2) => {
  const d1 = getDateFromUTC(date1);
  const d2 = getDateFromUTC(date2);
  
  if (d1 < d2) return -1;
  if (d1 > d2) return 1;
  return 0;
};