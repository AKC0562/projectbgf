/**
 * ==========================================================
 * FILE: src/middleware/auth.js
 * ==========================================================
 *
 * WHY THIS FILE EXISTS:
 * ---------------------
 * This is the authentication gatekeeper. Every protected endpoint passes
 * through this middleware FIRST. Its job:
 *
 * 1. Extract the JWT from the Authorization header (Bearer scheme)
 * 2. Verify the JWT signature and expiry
 * 3. Look up the user in the database
 * 4. Check that the user isn't banned or deleted
 * 5. Attach the user document to `req.user` for downstream use
 *
 * If any of these steps fail, the request is rejected with 401 Unauthorized.
 * Downstream middleware and controllers can then safely access `req.user`
 * knowing it's a valid, active user.
 *
 * HOW IT CONNECTS:
 * ----------------
 * - Used in route definitions: router.get('/profile', protect, getProfile)
 * - req.user is used by:
 *   - authorize.js (role checking)
 *   - kycRequired.js (KYC status checking)
 *   - All controllers (to know WHO is making the request)
 *   - Socket.io (JWT verification on handshake)
 */

import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Authentication middleware — verifies JWT and attaches user to request.
 *
 * Expected header format:
 *   Authorization: Bearer <access_token>
 *
 * On success: req.user = User document (without password/refreshTokens)
 * On failure: throws ApiError(401)
 */
const protect = asyncHandler(async (req, res, next) => {
  // ── Step 1: Extract Token ──
  // The Authorization header follows the format: "Bearer <token>"
  // We split on the space and take the second part.
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // No token provided — the client didn't include an Authorization header
  if (!token) {
    throw ApiError.unauthorized('Access denied — no authentication token provided');
  }

  // ── Step 2: Verify Token ──
  // jwt.verify throws JsonWebTokenError (bad signature) or
  // TokenExpiredError (past exp claim). Both are caught by asyncHandler
  // and handled by errorHandler.js.
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (error) {
    // Re-throw with our standard error format
    if (error.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Token has expired — please refresh');
    }
    throw ApiError.unauthorized('Invalid authentication token');
  }

  // ── Step 3: Find User ──
  // The JWT payload contains { userId, role } (set in helpers.js).
  // We look up the user to ensure they still exist and aren't banned.
  const user = await User.findById(decoded.userId);

  if (!user) {
    throw ApiError.unauthorized('User associated with this token no longer exists');
  }

  // ── Step 4: Check Ban Status ──
  if (user.isBanned) {
    throw ApiError.forbidden(
      `Your account has been suspended${user.banReason ? `: ${user.banReason}` : ''}`
    );
  }

  // ── Step 5: Attach User to Request ──
  // All downstream middleware and controllers can access req.user
  req.user = user;

  next();
});

export default protect;
