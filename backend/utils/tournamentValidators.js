import mongoose from "mongoose";

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

export const validateObjectId = (id, fieldName = "ID") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return [`Invalid ${fieldName}`];
  }
  return [];
};

export const validateTournamentUpdate = (tournament) => {
  const errors = [];
  if (!["pending", "registration"].includes(tournament.status)) {
    errors.push(
      "Only tournaments in 'pending' or 'registration' status can be edited"
    );
  }
  return errors;
};
