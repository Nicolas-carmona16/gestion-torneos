/**
 * @fileoverview Middleware to handle 404 not found and general server errors.
 * @module middlewares/errorMiddleware
 */

/**
 * Middleware to handle 404 Not Found errors.
 *
 * @function notFound
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const notFound = (req, res, next) => {
  res.status(404).json({
    message: `Not Found - ${req.originalUrl}`,
  });
};

/**
 * Global error-handling middleware.
 *
 * @function errorHandler
 * @param {Error} err
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

export { notFound, errorHandler };
