/**
 * ==========================================================
 * FILE: src/middleware/rateLimiter.js
 * ==========================================================
 *
 * WHY THIS FILE EXISTS:
 * ---------------------
 * Rate limiting prevents abuse:
 * - Brute force attacks on login (try millions of OTPs)
 * - OTP flooding (spam someone's phone with OTPs)
 * - Scraping (download all companion profiles)
 * - DDoS amplification (flood expensive endpoints like search)
 *
 * We create DIFFERENT rate limiters for different concerns:
 * 1. Global: 100 requests per 15 minutes per IP (general protection)
 * 2. Auth: 10 requests per 15 minutes per IP (login/register endpoints)
 * 3. OTP: 5 requests per hour per IP (SMS sending is expensive + abuse prevention)
 *
 * HOW IT CONNECTS:
 * ----------------
 * - globalLimiter is applied in app.js to all routes
 * - authLimiter is applied to auth.routes.js
 * - otpLimiter is applied specifically to the send-otp endpoint
 *
 * NOTE: express-rate-limit uses in-memory storage by default, which means:
 * - Limits reset when the server restarts
 * - In a multi-server deployment, each server has its own counter
 * For production multi-server deployments, use the Redis store adapter.
 */

import rateLimit from 'express-rate-limit';

/**
 * Global rate limiter — applied to ALL endpoints.
 *
 * 100 requests per 15 minutes per IP address.
 * This is a safety net — specific limiters (auth, OTP) are stricter.
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers (deprecated)
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests — please try again after 15 minutes',
  },
});

/**
 * Auth rate limiter — applied to login/register endpoints.
 *
 * 10 requests per 15 minutes per IP.
 * Prevents brute-force attacks on authentication.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many authentication attempts — please try again after 15 minutes',
  },
});

/**
 * OTP rate limiter — applied to OTP sending endpoints.
 *
 * 5 requests per hour per IP.
 * Stricter because:
 * 1. Each OTP costs money (SMS gateway charges)
 * 2. OTP flooding is a common abuse vector (spam someone's phone)
 * 3. Legitimate users rarely need more than 2-3 OTPs per session
 */
export const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'OTP request limit reached — please try again after 1 hour',
  },
});
