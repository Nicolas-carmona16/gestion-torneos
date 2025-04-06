/**
 * @fileoverview Middlewares for validating user input on different user-related routes.
 * @module middlewares/validationMiddleware
 */

import { check } from "express-validator";
import validateFields from "./validateFields.js";

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
  check("birthDate")
    .isISO8601()
    .withMessage("Invalid birth date format (YYYY-MM-DD)")
    .custom((value) => {
      const currentDate = new Date();
      const birthDate = new Date(value);
      if (birthDate > currentDate) {
        throw new Error("Birth date cannot be in the future");
      }
      return true;
    }),

  check("role")
    .optional()
    .custom((value) => {
      if (value && value !== "player") {
        throw new Error("Only the 'player' role is allowed for registration");
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
  check("birthDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid birth date format (YYYY-MM-DD)")
    .custom((value) => {
      const currentDate = new Date();
      const birthDate = new Date(value);
      if (birthDate > currentDate) {
        throw new Error("Birth date cannot be in the future");
      }
      return true;
    }),
  check("role")
    .optional()
    .isIn(["admin", "player", "referee"])
    .withMessage("Invalid role"),
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
  check("birthDate")
    .isISO8601()
    .withMessage("Invalid birth date format (YYYY-MM-DD)"),
  check("role")
    .isIn(["admin", "player", "referee"])
    .withMessage("Invalid role"),
  validateFields,
];

export { validateRegister, validateUpdateUser, validateAdminCreate };
