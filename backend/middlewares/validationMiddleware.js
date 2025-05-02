/**
 * @fileoverview Middlewares for validating user input on different user-related routes.
 * @module middlewares/validationMiddleware
 */

import { check } from "express-validator";
import validateFields from "./validateFields.js";
import mongoose from "mongoose";

/**
 * Validation rules for user registration.
 * @constant
 * @type {Array<Function>}
 */
const validateRegister = [
  check("firstName").notEmpty().withMessage("First name is required"),
  check("lastName").notEmpty().withMessage("Last name is required"),
  check("email").isEmail().withMessage("Invalid email"),
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  check("role")
    .optional()
    .custom((value) => {
      if (value && value !== "player") {
        throw new Error("Only the 'player' role is allowed for registration");
      }
      return true;
    }),
  check("sports")
    .optional()
    .isArray()
    .withMessage("Sports must be an array")
    .custom((value) => {
      if (value && value.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
        throw new Error("Contains invalid sport IDs");
      }
      return true;
    }),
  check("tournaments")
    .optional()
    .isArray()
    .withMessage("Tournaments must be an array")
    .custom((value) => {
      if (value && value.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
        throw new Error("Contains invalid tournament IDs");
      }
      return true;
    }),
  validateFields,
];

/**
 * Validation rules for updating a user (admin only).
 * @constant
 * @type {Array<Function>}
 */
const validateUpdateUser = [
  check("firstName")
    .optional()
    .notEmpty()
    .withMessage("First name is required"),
  check("lastName").optional().notEmpty().withMessage("Last name is required"),
  check("email").optional().isEmail().withMessage("Invalid email"),
  check("role")
    .optional()
    .isIn(["admin", "player", "referee"])
    .withMessage("Invalid role"),
  check("sports")
    .optional()
    .isArray()
    .withMessage("Sports must be an array")
    .custom((value) => {
      if (value && !value.every((id) => mongoose.Types.ObjectId.isValid(id))) {
        throw new Error("Sports array contains invalid ObjectId");
      }
      return true;
    }),
  check("tournaments")
    .optional()
    .isArray()
    .withMessage("Tournaments must be an array")
    .custom((value) => {
      if (value && !value.every((id) => mongoose.Types.ObjectId.isValid(id))) {
        throw new Error("Tournaments array contains invalid ObjectId");
      }
      return true;
    }),
  validateFields,
];

/**
 * Validation rules for admin to create a user.
 * @constant
 * @type {Array<Function>}
 */
const validateAdminCreate = [
  check("firstName").notEmpty().withMessage("First name is required"),
  check("lastName").notEmpty().withMessage("Last name is required"),
  check("email").isEmail().withMessage("Invalid email"),
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  check("role")
    .isIn(["admin", "player", "referee"])
    .withMessage("Invalid role"),
  check("sports")
    .optional()
    .isArray()
    .withMessage("Sports must be an array")
    .custom((value) => {
      if (value && !value.every((id) => mongoose.Types.ObjectId.isValid(id))) {
        throw new Error("Sports array contains invalid ObjectId");
      }
      return true;
    }),
  check("tournaments")
    .optional()
    .isArray()
    .withMessage("Tournaments must be an array")
    .custom((value) => {
      if (value && !value.every((id) => mongoose.Types.ObjectId.isValid(id))) {
        throw new Error("Tournaments array contains invalid ObjectId");
      }
      return true;
    }),
  validateFields,
];

export { validateRegister, validateUpdateUser, validateAdminCreate };
