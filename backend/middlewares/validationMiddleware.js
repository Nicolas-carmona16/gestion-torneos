import { check } from "express-validator";
import validateFields from "./validateFields.js";

const validateRegister = [
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
    .optional()
    .custom((value) => {
      if (value && value !== "player") {
        throw new Error("Only the 'player' role is allowed for registration");
      }
      return true;
    }),
  validateFields,
];

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
    .withMessage("Invalid birth date format (YYYY-MM-DD)"),
  check("role")
    .optional()
    .isIn(["admin", "player", "referee"])
    .withMessage("Invalid role"),
  validateFields,
];

export { validateRegister, validateUpdateUser };
