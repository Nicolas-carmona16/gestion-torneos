/**
 * @fileoverview Middleware to handle express-validator results.
 * @module middlewares/validateFields
 */

import { validationResult } from "express-validator";

/**
 * Middleware to validate fields after running express-validator checks.
 *
 * @function validateFields
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const validateFields = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export default validateFields;
