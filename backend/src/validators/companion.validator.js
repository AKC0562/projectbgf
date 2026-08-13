/**
 * ==========================================================
 * FILE: src/validators/companion.validator.js
 * ==========================================================
 *
 * WHY THIS FILE EXISTS:
 * ---------------------
 * Validation chains for companion profile endpoints:
 * - Create companion profile
 * - Update companion profile
 * - Search/discovery with filters
 *
 * HOW IT CONNECTS:
 * ----------------
 * - Used in companion.routes.js
 * - Runs before validate middleware and companion.controller.js
 */

import { body, query } from 'express-validator';
import { DAYS_OF_WEEK, PLATFORM_CONFIG } from '../constants/index.js';

/**
 * Validate companion profile creation.
 */
export const createCompanionProfileValidator = [
  body('displayName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Display name cannot exceed 100 characters'),

  body('tagline')
    .optional()
    .trim()
    .isLength({ max: PLATFORM_CONFIG.TAGLINE_MAX_LENGTH })
    .withMessage(`Tagline cannot exceed ${PLATFORM_CONFIG.TAGLINE_MAX_LENGTH} characters`),

  body('hourlyRate')
    .notEmpty()
    .withMessage('Hourly rate is required')
    .isFloat({ min: PLATFORM_CONFIG.MIN_HOURLY_RATE, max: PLATFORM_CONFIG.MAX_HOURLY_RATE })
    .withMessage(`Hourly rate must be between ₹${PLATFORM_CONFIG.MIN_HOURLY_RATE} and ₹${PLATFORM_CONFIG.MAX_HOURLY_RATE}`),

  body('categories')
    .isArray({ min: 1 })
    .withMessage('At least one category is required'),

  body('categories.*')
    .isMongoId()
    .withMessage('Each category must be a valid ID'),

  body('languages')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Maximum 10 languages allowed'),

  body('interests')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Maximum 20 interests allowed'),

  body('experience')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Experience description cannot exceed 1000 characters'),

  body('availability')
    .optional()
    .isArray()
    .withMessage('Availability must be an array'),

  body('availability.*.dayOfWeek')
    .optional()
    .isIn(DAYS_OF_WEEK)
    .withMessage(`Day must be one of: ${DAYS_OF_WEEK.join(', ')}`),

  body('availability.*.startTime')
    .optional()
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage('Start time must be in HH:MM format'),

  body('availability.*.endTime')
    .optional()
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage('End time must be in HH:MM format'),
];

/**
 * Validate companion profile update.
 * Same fields as create, but all optional.
 */
export const updateCompanionProfileValidator = [
  body('displayName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Display name cannot exceed 100 characters'),

  body('tagline')
    .optional()
    .trim()
    .isLength({ max: PLATFORM_CONFIG.TAGLINE_MAX_LENGTH })
    .withMessage(`Tagline cannot exceed ${PLATFORM_CONFIG.TAGLINE_MAX_LENGTH} characters`),

  body('hourlyRate')
    .optional()
    .isFloat({ min: PLATFORM_CONFIG.MIN_HOURLY_RATE, max: PLATFORM_CONFIG.MAX_HOURLY_RATE })
    .withMessage(`Hourly rate must be between ₹${PLATFORM_CONFIG.MIN_HOURLY_RATE} and ₹${PLATFORM_CONFIG.MAX_HOURLY_RATE}`),

  body('categories')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one category is required'),

  body('categories.*')
    .optional()
    .isMongoId()
    .withMessage('Each category must be a valid ID'),

  body('languages')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Maximum 10 languages allowed'),

  body('interests')
    .optional()
    .isArray({ max: 20 })
    .withMessage('Maximum 20 interests allowed'),

  body('experience')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Experience description cannot exceed 1000 characters'),

  body('availability')
    .optional()
    .isArray()
    .withMessage('Availability must be an array'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

/**
 * Validate companion search/discovery query params.
 */
export const searchCompanionsValidator = [
  query('category')
    .optional()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Category must be a valid ID or slug'),

  query('minRate')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum rate must be a positive number'),

  query('maxRate')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum rate must be a positive number'),

  query('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  query('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),

  query('radius')
    .optional()
    .isFloat({ min: 1, max: 100 })
    .withMessage('Radius must be between 1 and 100 km'),

  query('minRating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Minimum rating must be between 0 and 5'),

  query('language')
    .optional()
    .isString()
    .withMessage('Language must be a string'),

  query('sortBy')
    .optional()
    .isIn(['rating', 'price_low', 'price_high', 'distance', 'bookings'])
    .withMessage('Sort must be one of: rating, price_low, price_high, distance, bookings'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];
