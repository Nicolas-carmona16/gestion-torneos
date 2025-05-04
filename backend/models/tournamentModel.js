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
 * @property {Object} groupsStageSettings - Settings for the group stage format.
 * @property {number} groupsStageSettings.teamsPerGroup - The number of teams per group.
 * @property {number} groupsStageSettings.teamsAdvancingPerGroup - The number of teams advancing from each group.
 * @property {number} groupsStageSettings.matchesPerTeamInGroup - The number of matches each team plays in the group stage.
 * @property {number} bestOfMatches - The number of matches to be played in a best-of series. Defaults to 1.
 * @property {Date} registrationStart - The start date for team registrations.
 * @property {Date} registrationTeamEnd - The end date for team registrations.
 * @property {Date} registrationPlayerEnd - The end date for player registrations.
 * @property {Date} startDate - The start date of the tournament.
 * @property {Date} endDate - The end date of the tournament.
 * @property {number} maxTeams - The maximum number of teams allowed in the tournament.
 * @property {number} minPlayersPerTeam - The minimum number of players required in a team.
 * @property {number} maxPlayersPerTeam - The maximum number of players allowed in a team.
 * @property {boolean} isOlympiad - Indicates if the tournament is an Olympiad event. Defaults to false.
 * @property {string} status - The status of the tournament. Can be "coming soon", "registration open", "player adjustment", "preparation", "in progress", or "completed".
 * @property {mongoose.Schema.Types.ObjectId} createdBy - The ID of the user who created the tournament. References the `User` model.
 *
 * @example
 * const newTournament = new Tournament({
 *  name: "U18 Soccer Championship",
 *  description: "An annual soccer tournament for under 18 players.",
 *  sport: someSportId,
 *  format: "group-stage",
 *  groupsStageSettings: {
 *    teamsPerGroup: 4,
 *    teamsAdvancingPerGroup: 2,
 *    matchesPerTeamInGroup: 3,
 *  },
 *  bestOfMatches: 1,
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
    groupsStageSettings: {
      teamsPerGroup: {
        type: Number,
        required: function () {
          return this.format === "group-stage";
        },
      },
      teamsAdvancingPerGroup: {
        type: Number,
        required: function () {
          return this.format === "group-stage";
        },
        validate: {
          validator: function (value) {
            return value <= this.groupsStageSettings.teamsPerGroup;
          },
          message: "Teams advancing per group cannot exceed teams per group",
        },
      },
      matchesPerTeamInGroup: {
        type: Number,
        default: 1,
        required: function () {
          return this.format === "group-stage";
        },
      }
    },
    bestOfMatches: {
      type: Number,
      default: 1,
      required: true,
    },
    registrationStart: {
      type: Date,
      required: true,
    },
    registrationTeamEnd: {
      type: Date,
      required: true,
    },
    registrationPlayerEnd: {
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
    isOlympiad: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: [
        "coming soon",
        "registration open",
        "player adjustment",
        "preparation",
        "in progress",
        "completed",
      ],
      default: "coming soon",
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
