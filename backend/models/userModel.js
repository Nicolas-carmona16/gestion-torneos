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
 * @property {Date} birthDate - The birth date of the user.
 * @property {String} email - The email address of the user, must be unique.
 * @property {String} password - encrypted password of the user.
 * @property {String} role - The role of the user (admin, player, referee).
 * 
 * @example
 * const newUser = new User({
 *  firstName: "John",
 *  lastName: "Doe",
 *  birthDate: new Date("1990-01-01"),
 *  email: "john.doe@example.com",
 *  password: "hashed_password",
 *  role: "player",
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
    birthDate: {
      type: Date,
      required: true,
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
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
