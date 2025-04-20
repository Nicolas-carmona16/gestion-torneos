/**
 * @fileoverview Controller functions for handling sport-related operations such as retrieving sport rules.
 * @module controllers/sportController
 */

import Sport from "../models/sportModel.js";
import asyncHandler from "express-async-handler";

/**
 * @function getAllSports
 * @desc Get all sports
 * @route GET /api/sports
 * @access Public
 */
const getAllSports = asyncHandler(async (req, res) => {
  const sports = await Sport.find().sort({ name: 1 });
  res.status(200).json(sports);
});

/**
 * @function getSportRules
 * @desc Get rules of a specific sport
 * @route GET /api/sports/:id
 * @access Public
 */
const getSportRules = asyncHandler(async (req, res) => {
  const sport = await Sport.findById(req.params.id);
  if (!sport) {
    res.status(404);
    throw new Error("Sport not found");
  }

  res.json({
    _id: sport._id,
    name: sport.name,
    defaultRules: sport.defaultRules,
  });
});

export { getSportRules, getAllSports };
