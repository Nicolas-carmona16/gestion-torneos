import express from "express";
import User from "../models/userModel.js";
import { registerUser, loginUser } from "../controllers/userController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
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
