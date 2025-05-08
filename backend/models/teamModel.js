/**
 * @file teamModel.js
 * @module models/teamModel
 * @description This file defines the Team model using Mongoose for MongoDB.
 */

import mongoose from "mongoose";

/**
 * @typedef {Object} Player
 * @property {String} name - The name of the team.
 * @property {mongoose.Schema.Types.ObjectId} tournament - The ID of the tournament the team is participating in.
 * @property {mongoose.Schema.Types.ObjectId} captain - The ID of the user who is the captain of the team.
 * @property {Array} players - An array of player IDs that are part of the team.
 *
 * @example
 * const newPlayer = new Player({
 *  name: "Team A",
 *  tournament: "60d5f9f8b3c2a4b1f8c8e4e1",
 *  captain: "60d5f9f8b3c2a4b1f8c8e4e2",
 *  players: [
 *      "60d5f9f8b3c2a4b1f8c8e4e3",
 *      "60d5f9f8b3c2a4b1f8c8e4e4",
 *  ],
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
  },
  { timestamps: true }
);

const Team = mongoose.model("Team", teamSchema);
export default Team;
