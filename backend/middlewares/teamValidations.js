import { check, body } from "express-validator";
import validateFields from "./validateFields.js";
import mongoose from "mongoose";

export const validateRegisterTeam = [
  check("name").notEmpty().withMessage("Name is required"),
  check("tournamentId")
    .notEmpty()
    .withMessage("Tournament ID is required")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid tournament ID"),
  body("players")
    .isArray()
    .withMessage("Players must be an array")
    .custom((players) => {
      const uniqueEmails = new Set();
      const uniqueIdNumbers = new Set();

      for (const player of players) {
        if (!player.fullName || !player.fullName.trim()) {
          throw new Error("All players must have a full name");
        }

        if (!player.idNumber?.toString().trim()) {
          throw new Error("Identification number is required");
        }

        if (!/^\d+$/.test(player.idNumber.toString())) {
          throw new Error("Identification number must contain only numbers");
        }

        if (
          !player.email ||
          !/^[a-zA-Z0-9._-]+@udea\.edu\.co$/.test(player.email)
        ) {
          throw new Error("All players must have a valid institutional email");
        }

        if (uniqueEmails.has(player.email)) {
          throw new Error(`Email ${player.email} is duplicated`);
        }

        if (uniqueIdNumbers.has(player.idNumber)) {
          throw new Error(
            `Identification number ${player.idNumber} is duplicated`
          );
        }

        uniqueEmails.add(player.email);
        uniqueIdNumbers.add(player.idNumber);
      }
      return true;
    }),

  body("captainExtra.idNumber")
    .notEmpty()
    .withMessage("identification number of the captain is required"),

  body("captainExtra.eps")
    .notEmpty()
    .withMessage("EPS of the captain is required"),

  validateFields,
];

export const validateAddPlayers = [
  check("teamId")
    .notEmpty()
    .withMessage("Team ID is required")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid team ID"),

  body("newPlayers")
    .isArray({ min: 1 })
    .withMessage("At least one new player is required")
    .custom((players) => {
      const uniqueEmails = new Set();
      const uniqueIdNumbers = new Set();

      for (const player of players) {
        if (!player.fullName || !player.fullName.trim()) {
          throw new Error("Full name is required");
        }

        if (!player.idNumber?.toString().trim()) {
          throw new Error("Identification number is required");
        }

        if (!/^\d+$/.test(player.idNumber.toString())) {
          throw new Error("ID must contain only numbers");
        }

        if (
          !player.email ||
          !/^[a-zA-Z0-9._-]+@udea\.edu\.co$/.test(player.email)
        ) {
          throw new Error("Institutional email is required and must be valid");
        }

        if (uniqueEmails.has(player.email)) {
          throw new Error(`Email ${player.email} is duplicated`);
        }

        if (uniqueIdNumbers.has(player.idNumber)) {
          throw new Error(
            `Identification number ${player.idNumber} is duplicated`
          );
        }

        uniqueEmails.add(player.email);
        uniqueIdNumbers.add(player.idNumber);
      }
      return true;
    }),

  validateFields,
];
