/**
 * @file userModel.js
 * @module models/userModel
 * @description This file defines the User model using Mongoose for MongoDB.
 */

import mongoose from "mongoose";

/**
 * @typedef {Object} User
 * @property {String} firstName - The first name of the user.
 * @property {String} lastName - The last name of the user.
 * @property {String} email - The email address of the user, must be unique.
 * @property {String} password - encrypted password of the user.
 * @property {String} role - The role of the user (admin, player, referee).
 * @property {Array.<mongoose.Schema.Types.ObjectId>} sports - Array of sports the user is associated with (references Sport model).
 * @property {Array.<mongoose.Schema.Types.ObjectId>} tournaments - Array of tournaments the user is associated with (references Tournament model).
 *
 * @example
 * const newUser = new User({
 *  firstName: "John",
 *  lastName: "Doe",
 *  email: "john.doe@example.com",
 *  password: "hashed_password",
 *  role: "player",
 *  sports: ["5f8d0d55b54764421b7156da"],
 *  tournaments: ["5f8d0d55b54764421b7156db"]
 * });
 */

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "player", "referee"],
      required: true,
      default: "player",
    },
    sports: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sport",
        default: [],
      },
    ],
    tournaments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tournament",
        default: [],
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
