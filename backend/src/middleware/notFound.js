/**
 * ==========================================================
 * FILE: src/middleware/notFound.js
 * ==========================================================
 *
 * WHY THIS FILE EXISTS:
 * ---------------------
 * If a request comes in for a URL that doesn't match any registered route,
 * Express will default to a plain-text "Cannot GET /random-path" response.
 * That's unprofessional and leaks framework information.
 *
 * This middleware is mounted AFTER all routes but BEFORE the errorHandler.
 * It catches any request that fell through all route matchers and converts
 * it into a proper ApiError(404), which then flows to errorHandler for
 * consistent JSON formatting.
 *
 * HOW IT CONNECTS:
 * ----------------
 * - Mounted in app.js after all route definitions
 * - Creates an ApiError(404) with the attempted URL
 * - Passes to errorHandler via next(error)
 */

import ApiError from '../utils/ApiError.js';

/**
 * 404 catch-all middleware.
 * Any request reaching this middleware means no route matched.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const notFound = (req, res, next) => {
  const error = new ApiError(
    404,
    `Route not found: ${req.method} ${req.originalUrl}`
  );
  next(error);
};

export default notFound;
