/**
 * @file teamModel.js
 * @module models/teamModel
 * @description This file defines the Team model using Mongoose for MongoDB.
 */

import mongoose from "mongoose";

/**
 * @typedef {Object} Team
 * @property {String} name - The name of the team.
 * @property {mongoose.Schema.Types.ObjectId} tournament - The ID of the tournament the team is participating in.
 * @property {mongoose.Schema.Types.ObjectId} captain - The ID of the user who is the captain of the team.
 * @property {Array} players - An array of player IDs that are currently part of the team.
 * @property {Array} removedPlayers - An array of player IDs that were removed from the team with removal date.
 *
 * @example
 * const newTeam = new Team({
 *  name: "Team A",
 *  tournament: "60d5f9f8b3c2a4b1f8c8e4e1",
 *  captain: "60d5f9f8b3c2a4b1f8c8e4e2",
 *  players: [
 *      "60d5f9f8b3c2a4b1f8c8e4e3",
 *      "60d5f9f8b3c2a4b1f8c8e4e4",
 *  ],
 *  removedPlayers: [
 *      {
 *          player: "60d5f9f8b3c2a4b1f8c8e4e5",
 *          removedAt: "2024-01-15T10:30:00Z"
 *      }
 *  ]
 * });
 */

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },
    captain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    players: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Player",
      },
    ],
    removedPlayers: [
      {
        player: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Player",
          required: true,
        },
        removedAt: {
          type: Date,
          default: Date.now,
        },
        removedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const Team = mongoose.model("Team", teamSchema);
export default Team;
