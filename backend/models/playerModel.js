/**
 * @file playerModel.js
 * @module models/playerModel
 * @description This file defines the Player model using Mongoose for MongoDB.
 */

import mongoose from "mongoose";

/**
 * @typedef {Object} Player
 * @property {String} fullName - The full name of the player.
 * @property {String} idNumber - The unique identification number of the player.
 * @property {String} email - The email address of the player, must be unique.
 * @property {String} eps - The EPS (Entidad Promotora de Salud) of the player.
 * @property {String} career - The academic career of the player.
 *
 * @example
 * const newPlayer = new Player({
 *  fullName: "John Doe",
 *  idNumber: "123456789",
 *  email: "johndoe@example.com",
 *  eps: "EPS Example",
 *  career: "Ingeniería de Sistemas"
 * });
 */

const careerEnum = [
  "Bioingeniería",
  "Ingeniería Ambiental",
  "Ingeniería Civil",
  "Ingeniería Eléctrica",
  "Ingeniería Electrónica",
  "Ingeniería Industrial",
  "Ingeniería de Materiales",
  "Ingeniería Mecánica",
  "Ingeniería Química",
  "Ingeniería Sanitaria",
  "Ingeniería de Sistemas",
  "Ingeniería de Telecomunicaciones",
];

const playerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    idNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    eps: {
      type: {
        url: String,
        fileName: String,
      },
      required: true,
    },
    career: {
      type: String,
      required: true,
      enum: careerEnum,
      trim: true,
    },
  },
  { timestamps: true }
);

const Player = mongoose.model("Player", playerSchema);
export default Player;
