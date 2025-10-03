/**
 * @file matchModel.js
 * @module models/matchModel
 * @description This file contains the Match model for the database.
 */

import mongoose from "mongoose";

const matchSchema = new mongoose.Schema(
  {
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },
    group: {
      type: String,
      required: function () {
        return this.tournament.format === "group-stage";
      },
    },
    round: {
      type: String,
      required: true,
      enum: [
        "group",
        "round-of-16",
        "quarter-finals",
        "semi-finals",
        "final",
        "third-place",
      ],
    },
    team1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: function () {
        return !["pending", "walkover"].includes(this.status);
      },
    },
    team2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: function () {
        return (
          !["pending", "walkover"].includes(this.status) &&
          this.round !== "final" &&
          this.status !== "walkover"
        );
      },
    },
    date: {
      type: Date,
    },
    time: {
      type: String,
    },
    location: {
      type: String,
    },
    description: {
      type: String,
    },
    scoreTeam1: {
      type: Number,
      default: null,
    },
    scoreTeam2: {
      type: Number,
      default: null,
    },
    // Estos campos son para los partidos de voleibol (sets)
    setsTeam1: {
      type: Number,
      default: null,
    },
    setsTeam2: {
      type: Number,
      default: null,
    },
    setScores: [
      {
        setNumber: {
          type: Number,
          required: true,
        },
        scoreTeam1: {
          type: Number,
          required: true,
        },
        scoreTeam2: {
          type: Number,
          required: true,
        },
        winner: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Team",
          default: null,
        },
      },
    ],
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },
    status: {
      type: String,
      enum: [
        "scheduled",
        "pending",
        "in-progress",
        "completed",
        "postponed",
        "cancelled",
        "walkover",
      ],
      default: "scheduled",
    },
    matchday: {
      type: Number,
      required: function () {
        return this.round === "group";
      },
    },
    isBestOfSeries: {
      type: Boolean,
      default: false,
    },
    seriesMatches: [
      {
        scoreTeam1: Number,
        scoreTeam2: Number,
        date: Date,
        winner: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Team",
        },
      },
    ],
    bracketId: {
      type: String,
      required: function () {
        return this.round !== "group";
      },
    },
    seriesWinner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },
    seriesScore: {
      type: String,
      default: null,
    },
    nextMatchBracketId: {
      type: String,
      default: null,
    },
    // Campo para goleadores (solo para fútbol y fútbol sala)
    scorers: [
      {
        playerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Player",
          required: true,
        },
        teamId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Team",
          required: true,
        },
        goals: {
          type: Number,
          required: true,
          min: 1,
        },
        matchDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

const Match = mongoose.model("Match", matchSchema);
export default Match;
