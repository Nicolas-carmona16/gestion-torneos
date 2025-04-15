import mongoose from "mongoose";

const tournamentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
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
