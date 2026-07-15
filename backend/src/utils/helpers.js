/**
 * ==========================================================
 * FILE: src/utils/helpers.js
 * ==========================================================
 *
 * WHY THIS FILE EXISTS:
 * ---------------------
 * Small, pure utility functions that are used in multiple places but don't
 * belong to any specific service. Think of this as the "Swiss Army knife"
 * module — date math, string sanitization, pagination math, OTP generation.
 *
 * Rules for this file:
 * 1. Every function must be PURE (no side effects, no DB calls)
 * 2. Every function must be TESTABLE in isolation
 * 3. If a function grows complex enough to need its own module, move it
 *
 * HOW IT CONNECTS:
 * ----------------
 * - Models: calculateAge is used in User's age virtual
 * - Controllers: sanitizeUser strips sensitive fields before response
 * - Services: generateOTP creates codes for the OTP service
 * - Controllers: buildPaginationQuery standardizes pagination params
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';

/**
 * Generates a cryptographically random 6-digit OTP.
 *
 * We use crypto.randomInt instead of Math.random because Math.random
 * is not cryptographically secure — it uses a PRNG that could be
 * predicted. For auth codes, we need true randomness.
 *
 * @returns {string} 6-digit OTP as a string (preserving leading zeros)
 */
export const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Calculates age in years from a Date of Birth.
 *
 * This accounts for the birthday not having occurred yet this year.
 * e.g. If DOB is Dec 15, 2000 and today is Jul 15, 2026, age = 25 (not 26)
 * because the Dec birthday hasn't happened yet.
 *
 * @param {Date} dob - Date of birth
 * @returns {number} Age in whole years
 */
export const calculateAge = (dob) => {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  // If birth month hasn't occurred yet this year, or it's the birth month
  // but the day hasn't occurred yet, subtract 1
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

/**
 * Strips sensitive fields from a Mongoose user document before sending
 * it in an API response. Never send password hashes, refresh tokens,
 * or internal flags to the client.
 *
 * @param {object} userDoc - Mongoose document or plain object
 * @returns {object} Sanitized user object safe for API response
 */
export const sanitizeUser = (userDoc) => {
  // Convert Mongoose document to plain JS object if needed
  const user = userDoc.toObject ? userDoc.toObject() : { ...userDoc };

  // Remove fields that must never leave the server
  delete user.password;
  delete user.refreshTokens;
  delete user.__v;

  return user;
};

/**
 * Extracts and validates pagination parameters from the request query string.
 *
 * Handles edge cases:
 * - Negative page numbers → defaults to 1
 * - Limit exceeding MAX_LIMIT → capped at MAX_LIMIT
 * - Non-numeric values → defaults applied
 *
 * Returns the `skip` value needed by Mongoose's .skip() method.
 *
 * @param {object} query - Express req.query object
 * @param {number} defaultLimit - Default items per page (usually from PAGINATION constant)
 * @param {number} maxLimit - Maximum allowed items per page
 * @returns {{ page: number, limit: number, skip: number }}
 */
export const buildPaginationQuery = (query, defaultLimit = 20, maxLimit = 100) => {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  // Validate and apply defaults
  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = defaultLimit;
  if (limit > maxLimit) limit = maxLimit;

  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Builds a standardized pagination response object to include in API responses.
 *
 * @param {number} total - Total documents matching the query
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {{ total: number, page: number, limit: number, totalPages: number, hasNextPage: boolean, hasPrevPage: boolean }}
 */
export const buildPaginationResponse = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

/**
 * Generates a JWT access token.
 *
 * Short-lived (configured via ACCESS_TOKEN_EXPIRES env var, typically 15m).
 * Contains userId and role — enough for the auth middleware to authorize
 * requests without hitting the DB on every request.
 *
 * @param {object} payload - { userId, role }
 * @returns {string} Signed JWT
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES || '15m',
  });
};

/**
 * Generates a JWT refresh token.
 *
 * Long-lived (configured via REFRESH_TOKEN_EXPIRES env var, typically 7d).
 * Stored in the database per device so we can revoke individual sessions.
 *
 * @param {object} payload - { userId }
 * @returns {string} Signed JWT
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES || '7d',
  });
};

/**
 * Generates both access and refresh tokens in one call.
 * Convenience wrapper used during login and token refresh flows.
 *
 * @param {string} userId - MongoDB ObjectId as string
 * @param {string} role - User's current role
 * @returns {{ accessToken: string, refreshToken: string }}
 */
export const generateTokenPair = (userId, role) => {
  const accessToken = generateAccessToken({ userId, role });
  const refreshToken = generateRefreshToken({ userId });
  return { accessToken, refreshToken };
};

/**
 * Creates a URL-friendly slug from a string.
 * "Coffee Companion" → "coffee-companion"
 *
 * Used by the Category model to auto-generate slugs from names.
 *
 * @param {string} text - The text to slugify
 * @returns {string} URL-safe slug
 */
export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')       // Replace spaces with hyphens
    .replace(/[^\w-]+/g, '')    // Remove non-word characters (except hyphens)
    .replace(/--+/g, '-')       // Replace multiple hyphens with single
    .replace(/^-+/, '')         // Trim hyphens from start
    .replace(/-+$/, '');        // Trim hyphens from end
};
