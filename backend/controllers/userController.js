import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import asyncHandler from "express-async-handler";

// @desc Register new user
// @route POST /api/users/register
// @access Public
const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, birthDate, email, password, role } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    firstName,
    lastName,
    birthDate,
    email,
    password: hashedPassword,
    role,
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
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc Login user & store token in cookie
// @route POST /api/users/login
// @access Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    const token = generateToken(user._id);

    // Store token in cookie
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
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// @desc Logout user & clear cookie
// @route POST /api/users/logout
// @access Public
const logoutUser = (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "User logged out" });
};

// @desc Delete a user
// @route DELETE /api/users/:id
// @access Private (Admin only)
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error("You cannot delete yourself");
  }

  await user.deleteOne();
  res.json({ message: "User deleted" });
});

// @desc Update user details
// @route PUT /api/users/:id
// @access Private (Admin only)
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.firstName = req.body.firstName || user.firstName;
  user.lastName = req.body.lastName || user.lastName;
  user.email = req.body.email || user.email;
  user.birthDate = req.body.birthDate || user.birthDate;
  user.role = req.body.role || user.role;

  const updatedUser = await user.save();
  res.json({
    message: "User updated",
    _id: updatedUser._id,
    firstName: updatedUser.firstName,
    lastName: updatedUser.lastName,
    email: updatedUser.email,
    birthDate: updatedUser.birthDate,
    role: updatedUser.role,
  });
});

// @desc Create a new user (Admin only)
// @route POST /api/users/admin-create
// @access Private (Admin only)
const createUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, birthDate, email, password, role } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    firstName,
    lastName,
    birthDate,
    email,
    password: hashedPassword,
    role,
  });

  if (newUser) {
    res.status(201).json({
      _id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      role: newUser.role,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc Get all users
// @route GET /api/users/all-users
// @access Private (Admin only)
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  if (!users || users.length === 0) {
    res.status(404);
    throw new Error("No users found");
  }
  res.json(users);
});

// @desc Get user profile
// @route GET /api/users/profile
// @access Private (Authenticated users)
const getUserProfile = asyncHandler(async (req, res) => {
  res.json(req.user);
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
