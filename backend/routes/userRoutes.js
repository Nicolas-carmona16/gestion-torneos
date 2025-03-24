import express from "express";
import User from "../models/userModel.js";
import { check } from "express-validator";
import { registerUser, loginUser } from "../controllers/userController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import validateFields from "../middlewares/validationMiddleware.js";

const router = express.Router();

// validations
const validateRegister = [
  check("firstName").notEmpty().withMessage("First name is required"),
  check("lastName").notEmpty().withMessage("Last name is required"),
  check("email").isEmail().withMessage("Invalid email"),
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  validateFields,
];

router.post("/register", validateRegister, registerUser);
router.post("/login", loginUser);

// Protect routes
router.get("/profile", protect, (req, res) => {
  res.json(req.user);
});

// Solo el admin puede ver todos los usuarios
router.get("/all-users", protect, authorizeRoles("admin"), async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

export default router;
