/**
 * @description Utility to generate JWT token for authentication.
 * @module utils/generateToken
 */

import jwt from "jsonwebtoken";

/**
 * Generates a JSON Web Token (JWT) for the given user ID.
 *
 * @function
 * @param {string} id - The user ID to include in the token payload.
 * @returns {string} JWT token valid for 30 days.
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export default generateToken;
