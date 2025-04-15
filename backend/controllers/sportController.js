import Sport from "../models/sportModel.js";
import asyncHandler from "express-async-handler";

// @desc    Get rules of a specific sport
// @route   GET /api/sports/:id
// @access  Public
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

export { getSportRules };
