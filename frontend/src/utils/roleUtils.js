/**
 * @module roleUtils
 * @description Utility object to map internal role identifiers to user-friendly role names in Spanish.
 */

/**
 * @constant {Object} roleMapping
 * @description Maps user roles from system identifiers to display labels.
 * @property {string} player - Mapped label for the "player" role.
 * @property {string} referee - Mapped label for the "referee" role.
 * @property {string} admin - Mapped label for the "admin" role.
 */

export const roleMapping = {
  player: "Jugador",
  referee: "Árbitro",
  admin: "Administrador",
};
