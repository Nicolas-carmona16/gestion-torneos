/**
 * @file teamChangeLogModel.js
 * @description Modelo para el historial de novedades de equipos (TeamChangeLog)
 */

import mongoose from "mongoose";

const teamChangeLogSchema = new mongoose.Schema({
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tournament",
    required: true,
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: true,
  },
  responsible: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["add_player", "remove_player", "inscription"],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  playerAffected: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Player",
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  readBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

const TeamChangeLog = mongoose.model("TeamChangeLog", teamChangeLogSchema);
export default TeamChangeLog;
