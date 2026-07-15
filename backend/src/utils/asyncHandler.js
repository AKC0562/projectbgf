/**
 * ==========================================================
 * FILE: src/utils/asyncHandler.js
 * ==========================================================
 *
 * WHY THIS FILE EXISTS:
 * ---------------------
 * Every Express route handler that does async work (DB queries, API calls)
 * needs try/catch to forward errors to Express's error handling middleware.
 * Without it, an unhandled promise rejection crashes the server.
 *
 * The naive approach:
 *   const getUser = async (req, res, next) => {
 *     try {
 *       const user = await User.findById(req.params.id);
 *       res.json(user);
 *     } catch (err) {
 *       next(err);
 *     }
 *   };
 *
 * That try/catch block is identical in every single controller. With 50+
 * endpoints, that's 50+ identical try/catch blocks.
 *
 * asyncHandler wraps any async function and catches rejected promises
 * automatically, forwarding them to next() — which routes them to our
 * centralized errorHandler middleware.
 *
 * Usage:
 *   const getUser = asyncHandler(async (req, res) => {
 *     const user = await User.findById(req.params.id);
 *     res.json(new ApiResponse(200, user));
 *   });
 *
 * No try/catch needed. Clean controllers.
 *
 * NOTE: Express 5 does handle async errors natively. However, we still
 * use asyncHandler for two reasons:
 * 1. Explicit clarity — developers instantly see this is an async handler
 * 2. Portability — if we ever need Express 4 compatibility, it just works
 *
 * HOW IT CONNECTS:
 * ----------------
 * - Every controller function is wrapped with asyncHandler
 * - Caught errors flow to errorHandler.js middleware
 */

/**
 * Wraps an async Express route handler to catch promise rejections.
 *
 * @param {Function} fn - Async Express route handler (req, res, next) => Promise
 * @returns {Function} Express-compatible handler with error forwarding
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;
