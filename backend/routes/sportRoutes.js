/**
 * @fileoverview Defines all sport-related API routes.
 * @module routes/sportRoutes
 */

import express from "express";
import { getSportRules } from "../controllers/sportController.js";

const router = express.Router();

/**
 * Public routes
 */

/**
 * @route GET /api/sports/:id
 * @desc Get sport rules by ID
 * @access Public
 */
router.get("/:id", getSportRules);

export default router;
