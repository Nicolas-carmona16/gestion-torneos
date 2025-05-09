/**
 * @fileoverview Rate limiter middleware for login attempts.
 * @module middlewares/rateLimiter
 */

import rateLimit from "express-rate-limit";

/**
 * Rate limiter middleware for login endpoint.
 * Allows 5 requests every 15 minutes per IP.
 *
 * @constant
 * @type {Function}
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  message: "Too many login attempts, please try again",
  headers: true,
});

export default loginLimiter;
