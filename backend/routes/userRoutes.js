import express from "express";
import User from "../models/userModel.js";
import { check } from "express-validator";
import { registerUser, loginUser, logoutUser } from "../controllers/userController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import validateFields from "../middlewares/validationMiddleware.js";
import loginLimiter from "../middlewares/rateLimiter.js";

const router = express.Router();

// validations
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
    .isIn(["admin", "player", "referee"])
    .withMessage("Invalid role"),
  validateFields,
];

router.post("/register", validateRegister, registerUser);
router.post("/login", loginLimiter, loginUser);
router.post("/logout", logoutUser);

// Protect routes
router.get("/profile", protect, (req, res) => {
  res.json(req.user);
});

// Solo el admin puede ver todos los usuarios
router.get("/all-users", protect, authorizeRoles("admin"), async (req, res) => {
  const users = await User.find({});
  if (!users) {
    res.status(404);
    throw new Error("No users found");
  }
  res.json(users);
});

export default router;
