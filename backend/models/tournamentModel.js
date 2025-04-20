/**
 * @file tournamentModel.js
 * @module models/tournamentModel
 * @description This file defines the Tournament model using Mongoose for MongoDB.
 */

import mongoose from "mongoose";

/**
 * @property {string} name - The name of the tournament.
 * @property {string} description - A description of the tournament.
 * @property {mongoose.Schema.Types.ObjectId} sport - The sport associated with the tournament. References the `Sport` model.
 * @property {Object} customRules - Custom rules for the tournament, if any. Overrides the default rules of the sport.
 * @property {string} format - The format of the tournament. Can be "group-stage" or "elimination".
 * @property {Date} registrationStart - The start date for team registrations.
 * @property {Date} registrationEnd - The end date for team registrations.
 * @property {Date} startDate - The start date of the tournament.
 * @property {Date} endDate - The end date of the tournament.
 * @property {number} maxTeams - The maximum number of teams allowed in the tournament.
 * @property {number} minPlayersPerTeam - The minimum number of players required in a team.
 * @property {number} maxPlayersPerTeam - The maximum number of players allowed in a team.
 * @property {string} status - The status of the tournament. Can be "pending", "registration", "active", or "finished". Defaults to "pending".
 * @property {mongoose.Schema.Types.ObjectId} createdBy - The ID of the user who created the tournament. References the `User` model.
 * 
 * @example
 * const newTournament = new Tournament({
 *  name: "U18 Soccer Championship",
 *  description: "An annual soccer tournament for under 18 players.",
 *  sport: someSportId,
 *  format: "group-stage",
 *  registrationStart: new Date("2025-05-01"),
 *  registrationEnd: new Date("2025-05-31"),
 *  startDate: new Date("2025-06-10"),
 *  endDate: new Date("2025-06-20"),
 *  maxTeams: 16,
 *  minPlayersPerTeam: 7,
 *  maxPlayersPerTeam: 11,
 * });
 */

const tournamentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    sport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sport",
      required: true,
    },
    customRules: {
      type: Object,
    },
    format: {
      type: String,
      enum: ["group-stage", "elimination"],
      required: true,
    },
    registrationStart: {
      type: Date,
      required: true,
    },
    registrationEnd: {
      type: Date,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    maxTeams: {
      type: Number,
      required: true,
    },
    minPlayersPerTeam: {
      type: Number,
      required: true,
    },
    maxPlayersPerTeam: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "registration", "active", "finished"],
      default: "pending",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Tournament = mongoose.model("Tournament", tournamentSchema);
export default Tournament;
