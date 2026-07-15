/**
 * ==========================================================
 * FILE: src/validators/user.validator.js
 * ==========================================================
 *
 * WHY THIS FILE EXISTS:
 * ---------------------
 * Validation chains for user self-management endpoints:
 * - Update profile (name, bio, gender, dob)
 * - Update location (GeoJSON coordinates)
 * - Update settings (notification, privacy)
 * - Update emergency contact
 * - Upload KYC documents
 *
 * HOW IT CONNECTS:
 * ----------------
 * - Used in user.routes.js
 * - Runs before the validate middleware and user.controller.js
 */

import { body, param } from 'express-validator';
import { GENDER_ARRAY, KYC_DOCUMENT_TYPES_ARRAY } from '../constants/index.js';

/**
 * Validate profile update request.
 * All fields are optional — user can update one or multiple fields.
 */
export const updateProfileValidator = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),

  body('gender')
    .optional()
    .isIn(GENDER_ARRAY)
    .withMessage(`Gender must be one of: ${GENDER_ARRAY.join(', ')}`),

  body('dob')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date (YYYY-MM-DD format)'),

  body('city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City name cannot exceed 100 characters'),

  body('state')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('State name cannot exceed 100 characters'),
];

/**
 * Validate location update.
 * Expects GeoJSON coordinates: [longitude, latitude]
 */
export const updateLocationValidator = [
  body('longitude')
    .notEmpty()
    .withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),

  body('latitude')
    .notEmpty()
    .withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
];

/**
 * Validate emergency contact update.
 */
export const updateEmergencyContactValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Emergency contact name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),

  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Emergency contact phone is required')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Invalid Indian phone number'),

  body('relation')
    .trim()
    .notEmpty()
    .withMessage('Relation is required')
    .isLength({ max: 50 })
    .withMessage('Relation cannot exceed 50 characters'),
];

/**
 * Validate notification settings update.
 */
export const updateNotificationSettingsValidator = [
  body('push')
    .optional()
    .isBoolean()
    .withMessage('Push setting must be a boolean'),

  body('email')
    .optional()
    .isBoolean()
    .withMessage('Email setting must be a boolean'),

  body('sms')
    .optional()
    .isBoolean()
    .withMessage('SMS setting must be a boolean'),
];

/**
 * Validate privacy settings update.
 */
export const updatePrivacySettingsValidator = [
  body('showOnlineStatus')
    .optional()
    .isBoolean()
    .withMessage('showOnlineStatus must be a boolean'),

  body('showLastSeen')
    .optional()
    .isBoolean()
    .withMessage('showLastSeen must be a boolean'),

  body('showLocation')
    .optional()
    .isBoolean()
    .withMessage('showLocation must be a boolean'),
];

/**
 * Validate KYC document submission.
 */
export const submitKYCValidator = [
  body('documentType')
    .notEmpty()
    .withMessage('Document type is required')
    .isIn(KYC_DOCUMENT_TYPES_ARRAY)
    .withMessage(`Document type must be one of: ${KYC_DOCUMENT_TYPES_ARRAY.join(', ')}`),

  body('frontUrl')
    .notEmpty()
    .withMessage('Front document image URL is required')
    .isURL()
    .withMessage('Front URL must be a valid URL'),

  body('backUrl')
    .optional()
    .isURL()
    .withMessage('Back URL must be a valid URL'),

  body('selfieUrl')
    .notEmpty()
    .withMessage('Selfie URL is required for verification')
    .isURL()
    .withMessage('Selfie URL must be a valid URL'),
];

/**
 * Validate device token registration (for push notifications).
 */
export const registerDeviceTokenValidator = [
  body('deviceToken')
    .trim()
    .notEmpty()
    .withMessage('Device token is required')
    .isString()
    .withMessage('Device token must be a string'),
];

/**
 * Validate MongoDB ObjectId in URL params.
 */
export const userIdParamValidator = [
  param('userId')
    .isMongoId()
    .withMessage('Invalid user ID format'),
];
