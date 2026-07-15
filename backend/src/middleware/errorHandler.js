/**
 * ==========================================================
 * FILE: src/middleware/errorHandler.js
 * ==========================================================
 *
 * WHY THIS FILE EXISTS:
 * ---------------------
 * This is the SINGLE EXIT POINT for all errors in the application.
 * Instead of handling errors in 50 different controllers, every error
 * (thrown, rejected, or passed via next()) funnels through this one
 * middleware, which:
 *
 * 1. Identifies the error type (our ApiError, Mongoose validation,
 *    Mongoose cast, duplicate key, JWT error, etc.)
 * 2. Converts it to a consistent JSON shape
 * 3. Sends the response with the correct HTTP status code
 * 4. Logs the full stack trace in development mode only
 *
 * HOW IT CONNECTS:
 * ----------------
 * - Registered LAST in app.js middleware chain (after all routes)
 * - asyncHandler catches promise rejections and calls next(error)
 * - Controllers throw ApiError instances for expected failures
 * - Mongoose and JWT throw their own error types — we normalize them here
 *
 * Express error-handling middleware is identified by its 4-parameter
 * signature: (err, req, res, next). Express specifically looks for
 * this arity to route errors here instead of to normal middleware.
 */

import ApiError from '../utils/ApiError.js';

/**
 * Centralized error handling middleware.
 *
 * @param {Error} err - The error object (may be ApiError, MongooseError, etc.)
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Express next (required for 4-arg signature)
 */
const errorHandler = (err, req, res, next) => {
  // Start with defaults — assume it's an unknown 500 error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];
  let isOperational = err.isOperational || false;

  // ── Mongoose Validation Error ──
  // Thrown when a document fails schema validation (required fields,
  // enum mismatches, custom validators). We convert each validator
  // error into a structured field-level error object.
  if (err.name === 'ValidationError' && err.errors && !err.isOperational) {
    statusCode = 400;
    message = 'Validation failed';
    isOperational = true;
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
      value: e.value,
    }));
  }

  // ── Mongoose CastError ──
  // Thrown when an invalid ObjectId is passed (e.g. "abc123" as a user ID).
  // Without this handler, the raw Mongoose error would leak internal details.
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
    isOperational = true;
    errors = [];
  }

  // ── MongoDB Duplicate Key Error (code 11000) ──
  // Thrown when a unique index constraint is violated (e.g. duplicate email).
  // We extract the field name from the keyPattern to give a helpful message.
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    message = `Duplicate value for '${field}' — this ${field} is already registered`;
    isOperational = true;
    errors = [];
  }

  // ── JWT Errors ──
  // JsonWebTokenError: malformed token, invalid signature
  // TokenExpiredError: token past its exp claim
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
    isOperational = true;
    errors = [];
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired';
    isOperational = true;
    errors = [];
  }

  // ── Log in development mode ──
  // In dev, we want the full stack trace in the console for debugging.
  // In production, we only log non-operational (unexpected) errors
  // because operational errors are expected and handled.
  if (process.env.NODE_ENV === 'development') {
    console.error('──────── ERROR ────────');
    console.error(`Status: ${statusCode}`);
    console.error(`Message: ${message}`);
    console.error(`Operational: ${isOperational}`);
    console.error('Stack:', err.stack);
    console.error('───────────────────────');
  } else if (!isOperational) {
    // In production, log unexpected errors for monitoring/alerting
    console.error('UNEXPECTED ERROR:', err);
  }

  // ── Send Response ──
  // Consistent error response shape for all error types.
  // Stack trace is only included in development mode.
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: errors.length > 0 ? errors : undefined,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;
