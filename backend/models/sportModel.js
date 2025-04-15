/**
 * @file sportModel.js
 * @module models/sportModel
 * @description This file defines the Sport model using Mongoose for MongoDB.
 */

import mongoose from "mongoose";

/**
 * @typedef {Object} Sport
 * @property {String} name - The name of the sport.
 * @property {String} description - A brief description of the sport.
 * @property {Object} defaultRules - The default rules of the sport.
 * 
 * @example
 * const newSport = new Sport({
 *  name: "Soccer",
 *  description: "A sport played between two teams of eleven players with a spherical ball.",
 *  defaultRules: { maxPlayers: 11, gameDuration: 90 },
 * });
 */

const sportSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    defaultRules: {
      type: Object,
      required: true,
    },
  },
  { timestamps: true }
);

const Sport = mongoose.model("Sport", sportSchema);
export default Sport;
