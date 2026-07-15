/**
 * ==========================================================
 * FILE: src/validators/auth.validator.js
 * ==========================================================
 *
 * WHY THIS FILE EXISTS:
 * ---------------------
 * Every API endpoint must validate its input BEFORE reaching the
 * controller/service. Express-validator provides declarative validation
 * chains that run in the middleware pipeline.
 *
 * Why validate at the API layer instead of relying on Mongoose?
 * 1. FAIL FAST — reject malformed requests before hitting the DB
 * 2. BETTER ERRORS — express-validator gives field-level errors;
 *    Mongoose errors are harder to parse for clients
 * 3. SECURITY — prevents injection and unexpected data types
 * 4. SEPARATION — validation rules are independent of schema rules
 *
 * HOW IT CONNECTS:
 * ----------------
 * - Used in auth.routes.js between the route path and controller
 * - validate.js middleware runs after these chains to check results
 * - Errors flow to errorHandler.js
 */

import { body } from 'express-validator';
import { GENDER_ARRAY } from '../constants/index.js';

/**
 * Validate the send-otp request.
 * Only needs a valid Indian phone number.
 */
export const sendOTPValidator = [
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Invalid Indian phone number — must be 10 digits starting with 6-9'),
];

/**
 * Validate the verify-otp request.
 * Needs phone + 6-digit OTP code.
 */
export const verifyOTPValidator = [
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Invalid Indian phone number'),

  body('otp')
    .trim()
    .notEmpty()
    .withMessage('OTP is required')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be exactly 6 digits')
    .isNumeric()
    .withMessage('OTP must contain only numbers'),

  body('deviceId')
    .optional()
    .trim()
    .isString()
    .withMessage('Device ID must be a string'),
];

/**
 * Validate the registration request.
 * Called after OTP verification when isNewUser is true.
 */
export const registerValidator = [
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Invalid Indian phone number'),

  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),

  body('dob')
    .notEmpty()
    .withMessage('Date of birth is required')
    .isISO8601()
    .withMessage('Date of birth must be a valid date (YYYY-MM-DD format)'),

  body('gender')
    .optional()
    .isIn(GENDER_ARRAY)
    .withMessage(`Gender must be one of: ${GENDER_ARRAY.join(', ')}`),

  body('deviceId')
    .optional()
    .trim()
    .isString()
    .withMessage('Device ID must be a string'),
];

/**
 * Validate Google login request.
 * Needs the Google ID token for server-side verification.
 */
export const googleLoginValidator = [
  body('googleId')
    .trim()
    .notEmpty()
    .withMessage('Google ID is required'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail(),

  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required'),

  body('avatar')
    .optional()
    .trim()
    .isURL()
    .withMessage('Avatar must be a valid URL'),

  body('deviceId')
    .optional()
    .trim()
    .isString()
    .withMessage('Device ID must be a string'),
];

/**
 * Validate token refresh request.
 */
export const refreshTokenValidator = [
  body('refreshToken')
    .trim()
    .notEmpty()
    .withMessage('Refresh token is required'),

  body('deviceId')
    .optional()
    .trim()
    .isString()
    .withMessage('Device ID must be a string'),
];

/**
 * Validate logout request.
 */
export const logoutValidator = [
  body('refreshToken')
    .trim()
    .notEmpty()
    .withMessage('Refresh token is required'),
];
