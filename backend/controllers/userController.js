/**
 * @fileoverview Controller functions for handling user operations such as register, login, logout, CRUD, and profile retrieval.
 * @module controllers/userController
 */

import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import asyncHandler from "express-async-handler";
import Sport from "../models/sportModel.js";
import Tournament from "../models/tournamentModel.js";

/**
 * @function registerUser
 * @desc Register new user
 * @route POST /api/users/register
 * @access Public
 */
const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, role, sports, tournaments } =
    req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  if (sports && sports.length > 0) {
    const existingSports = await Sport.find({
      _id: { $in: sports },
    }).select("_id");

    if (existingSports.length !== sports.length) {
      res.status(400);
      throw new Error("One or more sports do not exist");
    }
  }

  if (tournaments && tournaments.length > 0) {
    const existingTournaments = await Tournament.find({
      _id: { $in: tournaments },
    }).select("_id");

    if (existingTournaments.length !== tournaments.length) {
      res.status(400);
      throw new Error("One or more tournaments do not exist");
    }
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    role: role || "player",
    sports: sports || [],
    tournaments: tournaments || [],
  });

  if (user) {
    const token = generateToken(user._id);

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      sports: user.sports,
      tournaments: user.tournaments,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

/**
 * @function loginUser
 * @desc Login user & store token in cookie
 * @route POST /api/users/login
 * @access Public
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email })
    .populate({
      path: "sports",
      select: "name",
    })
    .populate({
      path: "tournaments",
      select: "name",
    });

  if (user && (await bcrypt.compare(password, user.password))) {
    const token = generateToken(user._id);

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      sports: user.sports.map((sport) => ({
        _id: sport._id,
        name: sport.name,
      })),
      tournaments: user.tournaments.map((tournament) => ({
        _id: tournament._id,
        name: tournament.name,
      })),
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

/**
 * @function logoutUser
 * @desc Logout user & clear cookie
 * @route POST /api/users/logout
 * @access Public
 */
const logoutUser = (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "User logged out" });
};

/**
 * @function deleteUser
 * @desc Delete a user
 * @route DELETE /api/users/:id
 * @access Private (Admin only)
 */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user._id.toString() === req.user._id.toString()) {
    res.status(403);
    throw new Error("You cannot delete your own account");
  }

  if (req.user.role !== "admin") {
    res.status(403);
    throw new Error("Only admin users can delete accounts");
  }

  await user.deleteOne();
  res.json({ message: "User deleted" });
});

/**
 * @function updateUser
 * @desc Update user details
 * @route PUT /api/users/:id
 * @access Private (Admin only)
 */
const updateUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, role, sports, tournaments } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (sports !== undefined) {
    if (!Array.isArray(sports)) {
      res.status(400);
      throw new Error("Sports must be an array");
    }

    const existingSports = await Sport.countDocuments({ _id: { $in: sports } });
    if (existingSports !== sports.length) {
      res.status(400);
      throw new Error("One or more sports are invalid");
    }
    user.sports = sports;
  }

  if (tournaments !== undefined) {
    if (!Array.isArray(tournaments)) {
      res.status(400);
      throw new Error("Tournaments must be an array");
    }

    const existingTournaments = await Tournament.countDocuments({
      _id: { $in: tournaments },
    });
    if (existingTournaments !== tournaments.length) {
      res.status(400);
      throw new Error("One or more tournaments are invalid");
    }
    user.tournaments = tournaments;
  }

  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      res.status(400);
      throw new Error("Email already in use");
    }
    user.email = email;
  }
  if (role) user.role = role;

  const updatedUser = await user.save();
  const populatedUser = await User.findById(updatedUser._id)
    .populate("sports", "name")
    .populate("tournaments", "name")
    .select("-password -__v");

  res.json({
    message: "User updated successfully",
    user: {
      _id: populatedUser._id,
      firstName: populatedUser.firstName,
      lastName: populatedUser.lastName,
      email: populatedUser.email,
      role: populatedUser.role,
      sports: populatedUser.sports.map((sport) => ({
        _id: sport._id,
        name: sport.name,
      })),
      tournaments: populatedUser.tournaments.map((tournament) => ({
        _id: tournament._id,
        name: tournament.name,
      })),
    },
  });
});

/**
 * @function createUser
 * @desc Create a new user (Admin only)
 * @route POST /api/users/admin-create
 * @access Private (Admin only)
 */
const createUser = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    role = "player",
    sports = [],
    tournaments = [],
  } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  if (sports.length > 0) {
    const existingSports = await Sport.find({ _id: { $in: sports } }).select(
      "_id"
    );
    if (existingSports.length !== sports.length) {
      const existingSportIds = existingSports.map((s) => s._id.toString());
      const invalidSports = sports.filter(
        (id) => !existingSportIds.includes(id)
      );
      res.status(400);
      throw new Error(`Invalid sports IDs: ${invalidSports.join(", ")}`);
    }
  }

  if (tournaments.length > 0) {
    const existingTournaments = await Tournament.find({
      _id: { $in: tournaments },
    }).select("_id");

    if (existingTournaments.length !== tournaments.length) {
      const existingTournamentIds = existingTournaments.map((t) =>
        t._id.toString()
      );
      const invalidTournaments = tournaments.filter(
        (id) => !existingTournamentIds.includes(id)
      );
      res.status(400);
      throw new Error(
        `Invalid tournament IDs: ${invalidTournaments.join(", ")}`
      );
    }
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    role,
    sports,
    tournaments,
  });

  const createdUser = await User.findById(newUser._id)
    .populate("sports", "name")
    .populate("tournaments", "name")
    .select("-password -__v");

  if (createdUser) {
    res.status(201).json({
      _id: createdUser._id,
      firstName: createdUser.firstName,
      lastName: createdUser.lastName,
      email: createdUser.email,
      role: createdUser.role,
      sports: createdUser.sports.map((sport) => ({
        _id: sport._id,
        name: sport.name,
      })),
      tournaments: createdUser.tournaments.map((tournament) => ({
        _id: tournament._id,
        name: tournament.name,
      })),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

/**
 * @function getAllUsers
 * @desc Get all users
 * @route GET /api/users/all-users
 * @access Private (Admin only)
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({})
    .select("-password -__v")
    .populate({
      path: "sports",
      select: "name _id",
    })
    .populate({
      path: "tournaments",
      select: "name _id",
    });

  if (!users || users.length === 0) {
    res.status(404);
    throw new Error("No users found");
  }

  const formattedUsers = users.map((user) => ({
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    sports: user.sports.map((sport) => ({
      _id: sport._id,
      name: sport.name,
    })),
    tournaments: user.tournaments.map((tournament) => ({
      _id: tournament._id,
      name: tournament.name,
    })),
  }));

  res.json(formattedUsers);
});

/**
 * @function getUserProfile
 * @desc Get user profile
 * @route GET /api/users/profile
 * @access Private (Authenticated users)
 */
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate({
      path: "sports",
      select: "name _id",
    })
    .populate({
      path: "tournaments",
      select: "name _id",
    })
    .select("-password -__v");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const userProfile = {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    sports: user.sports.map((sport) => ({
      _id: sport._id,
      name: sport.name,
    })),
    tournaments: user.tournaments.map((tournament) => ({
      _id: tournament._id,
      name: tournament.name,
    })),
  };

  res.json(userProfile);
});

export {
  registerUser,
  loginUser,
  logoutUser,
  deleteUser,
  updateUser,
  createUser,
  getUserProfile,
  getAllUsers,
};
