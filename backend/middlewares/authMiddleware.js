/**
 * @fileoverview Middleware functions for route protection and role-based authorization.
 * @module middlewares/authMiddleware
 */

import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";

/**
 * Middleware to protect routes by verifying JWT token from cookies.
 * Adds the user object to `req.user` if token is valid.
 *
 * @function protect
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws {Error} If token is missing or invalid.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token = req.cookies.jwt;

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!req.user) {
      req.user = await User.findById(decoded.id).select("-password");
    }

    next();
  } catch (error) {
    res.status(401);
    throw new Error("Not authorized, token failed");
  }
});

/**
 * Middleware to restrict access to users with specific roles.
 *
 * @function authorizeRoles
 * @param {...string} roles - Allowed roles ('admin', 'user', 'referee')
 * @returns {Function} Middleware function
 * @throws {Error} If the user's role is not authorized.
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error("Not authorized for this action");
    }
    next();
  };
};

export { protect, authorizeRoles };
