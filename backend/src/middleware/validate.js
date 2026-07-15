/**
 * ==========================================================
 * FILE: src/middleware/validate.js
 * ==========================================================
 *
 * WHY THIS FILE EXISTS:
 * ---------------------
 * Express-validator runs validation chains but does NOT automatically
 * reject the request on failure — it only collects errors. You must
 * explicitly check the results and decide what to do.
 *
 * Without this middleware, every controller would need:
 *   const errors = validationResult(req);
 *   if (!errors.isEmpty()) { return res.status(400)... }
 *
 * This middleware sits between the validator chains and the controller:
 *   router.post('/register', [...validatorChains], validate, controller)
 *
 * It checks for validation errors and, if any exist, throws an ApiError(400)
 * with the structured errors — which then flows to our errorHandler.
 *
 * HOW IT CONNECTS:
 * ----------------
 * - Used in every route after express-validator chains
 * - Produces ApiError(400) with field-level error details
 * - Error flows to errorHandler.js for consistent response
 */

import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

/**
 * Validation result checker middleware.
 *
 * Runs after express-validator chains. If validation fails, it formats
 * the errors into a consistent shape and throws ApiError(400).
 *
 * Error shape sent to client:
 * {
 *   success: false,
 *   statusCode: 400,
 *   message: "Validation failed",
 *   errors: [
 *     { field: "email", message: "Invalid email address", value: "not-an-email" },
 *     { field: "phone", message: "Invalid Indian phone number", value: "123" }
 *   ]
 * }
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Map express-validator's error format to our API's error format
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
      value: err.value,
    }));

    throw new ApiError(400, 'Validation failed', formattedErrors);
  }

  // No validation errors — proceed to the controller
  next();
};

export default validate;
