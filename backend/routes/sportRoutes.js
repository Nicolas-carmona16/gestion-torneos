/**
 * @fileoverview Defines all sport-related API routes.
 * @module routes/sportRoutes
 */

import express from "express";
import { getAllSports, getSportRules } from "../controllers/sportController.js";

const router = express.Router();

/**
 * Public routes
 */

/**
 * @route GET /api/sports
 * @desc Get all sports
 * @access Public
 */
router.get("/", getAllSports);

/**
 * @route GET /api/sports/:id
 * @desc Get sport rules by ID
 * @access Public
 */
router.get("/:id", getSportRules);

export default router;
