import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  deleteUser,
  updateUser,
  createUser,
  getUserProfile,
  getAllUsers,
} from "../controllers/userController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import { validateRegister, validateUpdateUser } from "../middlewares/validationMiddleware.js";
import loginLimiter from "../middlewares/rateLimiter.js";

const router = express.Router();

// Public routes
router.post("/register", validateRegister, registerUser);
router.post("/login", loginLimiter, loginUser);
router.post("/logout", logoutUser);

// Protect routes
router.get("/profile", protect, getUserProfile);

// Admin-only routes
router.delete("/:id", protect, authorizeRoles("admin"), deleteUser);
router.put("/:id", protect, authorizeRoles("admin"), validateUpdateUser, updateUser);
router.post("/admin-create", protect, authorizeRoles("admin"), validateRegister, createUser);
router.get("/all-users", protect, authorizeRoles("admin"), getAllUsers);

export default router;
