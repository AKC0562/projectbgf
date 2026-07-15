/**
 * ==========================================================
 * FILE: src/routes/auth.routes.js
 * ==========================================================
 *
 * WHY THIS FILE EXISTS:
 * ---------------------
 * Route files are the WIRING DIAGRAM of the API. Each file maps:
 *   HTTP method + URL path → middleware chain → controller method
 *
 * This keeps routing separate from logic. When a new developer joins,
 * they can open this file and instantly see every auth endpoint, what
 * middleware it passes through, and which controller handles it.
 *
 * HOW IT CONNECTS:
 * ----------------
 * - Mounted in app.js as: app.use('/api/v1/auth', authRoutes)
 * - Each route specifies: validators → validate → controller
 * - Some routes add rate limiters and auth middleware
 */

import { Router } from 'express';

// Controllers
import {
  sendOTP,
  verifyOTP,
  register,
  googleLogin,
  refreshToken,
  logout,
  logoutAll,
} from '../controllers/auth.controller.js';

// Validators
import {
  sendOTPValidator,
  verifyOTPValidator,
  registerValidator,
  googleLoginValidator,
  refreshTokenValidator,
  logoutValidator,
} from '../validators/auth.validator.js';

// Middleware
import validate from '../middleware/validate.js';
import protect from '../middleware/auth.js';
import { authLimiter, otpLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// ──────────────────────────────────────────────
// Public Routes (no authentication required)
// ──────────────────────────────────────────────

/**
 * POST /api/v1/auth/send-otp
 *
 * Middleware pipeline:
 * 1. otpLimiter — max 5 OTP requests per hour per IP
 * 2. sendOTPValidator — validate phone number format
 * 3. validate — check validation results, throw 400 if invalid
 * 4. sendOTP — controller method
 */
router.post('/send-otp', otpLimiter, sendOTPValidator, validate, sendOTP);

/**
 * POST /api/v1/auth/verify-otp
 *
 * Middleware pipeline:
 * 1. authLimiter — max 10 auth attempts per 15 min per IP
 * 2. verifyOTPValidator — validate phone + OTP format
 * 3. validate — check validation results
 * 4. verifyOTP — controller method
 */
router.post('/verify-otp', authLimiter, verifyOTPValidator, validate, verifyOTP);

/**
 * POST /api/v1/auth/register
 *
 * Middleware pipeline:
 * 1. authLimiter — prevent registration spam
 * 2. registerValidator — validate all registration fields
 * 3. validate — check validation results
 * 4. register — controller method
 */
router.post('/register', authLimiter, registerValidator, validate, register);

/**
 * POST /api/v1/auth/google
 *
 * Middleware pipeline:
 * 1. authLimiter — prevent abuse
 * 2. googleLoginValidator — validate Google token
 * 3. validate — check validation results
 * 4. googleLogin — controller method
 */
router.post('/google', authLimiter, googleLoginValidator, validate, googleLogin);

/**
 * POST /api/v1/auth/refresh-token
 *
 * No rate limiter here because this is called automatically by the
 * client when the access token expires (every 15 minutes).
 * Rate limiting this would break the user experience.
 */
router.post('/refresh-token', refreshTokenValidator, validate, refreshToken);

// ──────────────────────────────────────────────
// Protected Routes (authentication required)
// ──────────────────────────────────────────────

/**
 * POST /api/v1/auth/logout
 *
 * Requires valid access token to identify which user is logging out.
 */
router.post('/logout', protect, logoutValidator, validate, logout);

/**
 * POST /api/v1/auth/logout-all
 *
 * Requires valid access token. Logs out from ALL devices.
 */
router.post('/logout-all', protect, logoutAll);

export default router;
