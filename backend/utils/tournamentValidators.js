import mongoose from "mongoose";
import { compareDatesOnly } from "./dateUtils.js";

/**
 * Validates the input data for creating or updating a tournament.
 *
 * @param {Object} data - The input data for the tournament.
 * @param {string} data.registrationStart - The registration start date.
 * @param {string} data.registrationTeamEnd - The registration end date for teams.
 * @param {string} data.registrationPlayerEnd - The registration end date for players.
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
    format,
    groupsStageSettings,
    bestOfMatches,
    registrationStart,
    registrationTeamEnd,
    registrationPlayerEnd,
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

  if (compareDatesOnly(registrationStart, registrationTeamEnd) >= 0) {
    errors.push(
      "Registration start date must be before team registration end date"
    );
  }

  if (compareDatesOnly(registrationTeamEnd, registrationPlayerEnd) >= 0) {
    errors.push(
      "Team registration end date must be before player registration end date"
    );
  }

  if (compareDatesOnly(registrationTeamEnd, startDate) >= 0) {
    errors.push(
      "Team registration end date must be before tournament start date"
    );
  }

  if (compareDatesOnly(startDate, endDate) >= 0) {
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

  if (bestOfMatches < 1) {
    errors.push("Best of matches must be at least 1");
  }

  if (format === "group-stage") {
    if (!groupsStageSettings) {
      errors.push("groupsStageSettings is required for group-stage format");
    } else {
      const { teamsPerGroup, teamsAdvancingPerGroup, matchesPerTeamInGroup } =
        groupsStageSettings;

      if (!teamsPerGroup || isNaN(teamsPerGroup) || teamsPerGroup < 2) {
        errors.push("teamsPerGroup must be at least 2");
      }

      if (
        !teamsAdvancingPerGroup ||
        isNaN(teamsAdvancingPerGroup) ||
        teamsAdvancingPerGroup < 1
      ) {
        errors.push("teamsAdvancingPerGroup must be at least 1");
      }

      if (teamsAdvancingPerGroup >= teamsPerGroup) {
        errors.push("teamsAdvancingPerGroup must be less than teamsPerGroup");
      }

      if (
        matchesPerTeamInGroup &&
        !["single", "double"].includes(matchesPerTeamInGroup)
      ) {
        errors.push("matchesPerTeamInGroup must be either 'single' or 'double'");
      }
    }
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
  if (
    ![
      "coming soon",
      "registration open",
      "player adjustment",
      "preparation",
      "in progress",
      "completed",
    ].includes(tournament.status)
  ) {
    errors.push(
      "Only tournaments in 'coming soon', 'registration open', 'player adjustment', 'preparation', 'in progress' or 'completed' status can be edited"
    );
  }
  return errors;
};
