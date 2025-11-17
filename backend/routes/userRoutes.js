/**
 * @fileoverview Defines all user-related API routes.
 * @module routes/userRoutes
 */

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
  getWebSocketToken,
} from "../controllers/userController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import {
  validateRegister,
  validateUpdateUser,
  validateAdminCreate,
} from "../middlewares/validationMiddleware.js";
import loginLimiter from "../middlewares/rateLimiter.js";

const router = express.Router();

/**
 * Public routes
 */

/**
 * @route POST /api/users/register
 * @desc Register a new user
 * @access Public
 */
router.post("/register", validateRegister, registerUser);

/**
 * @route POST /api/users/login
 * @desc Login a user and store JWT in cookie
 * @access Public
 * @note Uses rate limiting to prevent brute-force attacks
 */
router.post("/login", loginLimiter, loginUser);

/**
 * @route POST /api/users/logout
 * @desc Logout a user and clear JWT cookie
 * @access Public
 */
router.post("/logout", logoutUser);

/**
 * Protected routes
 */

/**
 * @route GET /api/users/profile
 * @desc Get user profile
 * @access Private (Authenticated users only)
 */
router.get("/profile", protect, getUserProfile);

/**
 * @route GET /api/users/ws-token
 * @desc Get JWT token for WebSocket connection
 * @access Private (Authenticated users only)
 */
router.get("/ws-token", protect, getWebSocketToken);

/**
 * Admin-only routes
 */

/**
 * @route DELETE /api/users/:id
 * @desc Delete a user by ID
 * @access Private (Admin only)
 */
router.delete("/:id", protect, authorizeRoles("admin"), deleteUser);

/**
 * @route PUT /api/users/:id
 * @desc Update a user by ID
 * @access Private (Admin only)
 * @note This route is used for admin users to update user information.
 */
router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  validateUpdateUser,
  updateUser
);

/**
 * @route POST /api/users/admin-create
 * @desc Admin creates a new user manually
 * @access Private (Admin only)
 */
router.post(
  "/admin-create",
  protect,
  authorizeRoles("admin"),
  validateAdminCreate,
  createUser
);

/**
 * @route GET /api/users/all-users
 * @desc Get list of all users
 * @access Private (Admin only)
 */
router.get("/all-users", protect, authorizeRoles("admin"), getAllUsers);

export default router;
