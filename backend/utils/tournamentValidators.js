import mongoose from "mongoose";

/**
 * Validates the input data for creating or updating a tournament.
 *
 * @param {Object} data - The input data for the tournament.
 * @param {string} data.registrationStart - The registration start date.
 * @param {string} data.registrationEnd - The registration end date.
 * @param {string} data.startDate - The tournament start date.
 * @param {string} data.endDate - The tournament end date.
 * @param {number} data.minPlayersPerTeam - The minimum number of players per team.
 * @param {number} data.maxPlayersPerTeam - The maximum number of players per team.
 * @param {number} data.maxTeams - The maximum number of teams.
 * @param {string} data.sport - The ID of the sport associated with the tournament.
 * @returns {string[]} - An array of error messages. If empty, the input is valid.
 *
 * @example
 * const errors = validateTournamentInput(data);
 */
export const validateTournamentInput = (data) => {
  const {
    registrationStart,
    registrationEnd,
    startDate,
    endDate,
    minPlayersPerTeam,
    maxPlayersPerTeam,
    maxTeams,
  } = data;

  const errors = [];

  if (!mongoose.Types.ObjectId.isValid(data.sport)) {
    errors.push("Invalid sport ID");
  }

  if (new Date(registrationStart) >= new Date(registrationEnd)) {
    errors.push("Registration start date must be before registration end date");
  }

  if (new Date(registrationEnd) >= new Date(startDate)) {
    errors.push("Registration end date must be before tournament start date");
  }

  if (new Date(startDate) >= new Date(endDate)) {
    errors.push("Tournament end date must be after start date");
  }

  if (minPlayersPerTeam > maxPlayersPerTeam) {
    errors.push(
      "Minimum players per team cannot be greater than maximum players per team"
    );
  }

  if (minPlayersPerTeam < 1) {
    errors.push("Minimum players per team must be at least 1");
  }

  if (maxTeams < 2) {
    errors.push("There must be at least 2 teams allowed in the tournament");
  }

  return errors;
};

/**
 * Validates whether a given ID is a valid MongoDB ObjectId.
 *
 * @param {string} id - The ID to validate.
 * @param {string} [fieldName="ID"] - The name of the field being validated.
 * @returns {string[]} - An array containing the error message if invalid, otherwise an empty array.
 * 
 * @example
 * const errors = validateObjectId(id, "sport");
 */
export const validateObjectId = (id, fieldName = "ID") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return [`Invalid ${fieldName}`];
  }
  return [];
};

/**
 * Validates whether a tournament can be updated based on its status.
 *
 * @param {Object} tournament - The tournament object to validate.
 * @param {string} tournament.status - The current status of the tournament.
 * @returns {string[]} - An array of error messages. If empty, the update is valid.
 * 
 * @example
 * const errors = validateTournamentUpdate(tournament);
 */
export const validateTournamentUpdate = (tournament) => {
  const errors = [];
  if (!["pending", "registration"].includes(tournament.status)) {
    errors.push(
      "Only tournaments in 'pending' or 'registration' status can be edited"
    );
  }
  return errors;
};
