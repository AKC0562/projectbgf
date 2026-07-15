/**
 * ==========================================================
 * FILE: src/validators/booking.validator.js
 * ==========================================================
 */

import { body, param, query } from 'express-validator';
import { BOOKING_STATUS_ARRAY } from '../constants/index.js';

export const createBookingValidator = [
  body('companionProfileId')
    .notEmpty().withMessage('Companion profile ID is required')
    .isMongoId().withMessage('Invalid companion profile ID'),

  body('categoryId')
    .notEmpty().withMessage('Category ID is required')
    .isMongoId().withMessage('Invalid category ID'),

  body('scheduledDate')
    .notEmpty().withMessage('Scheduled date is required')
    .isISO8601().withMessage('Date must be in YYYY-MM-DD format'),

  body('scheduledStartTime')
    .notEmpty().withMessage('Start time is required')
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('Start time must be HH:MM'),

  body('scheduledEndTime')
    .notEmpty().withMessage('End time is required')
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('End time must be HH:MM'),

  body('venue.name')
    .notEmpty().withMessage('Venue name is required')
    .isLength({ max: 200 }).withMessage('Venue name too long'),

  body('venue.address')
    .notEmpty().withMessage('Venue address is required')
    .isLength({ max: 500 }).withMessage('Venue address too long'),

  body('venue.location.coordinates')
    .optional()
    .isArray({ min: 2, max: 2 }).withMessage('Coordinates must be [lng, lat]'),

  body('duration')
    .notEmpty().withMessage('Duration is required')
    .isFloat({ min: 1, max: 12 }).withMessage('Duration must be 1-12 hours'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
];

export const bookingIdParamValidator = [
  param('bookingId')
    .isMongoId().withMessage('Invalid booking ID'),
];

export const cancelBookingValidator = [
  param('bookingId')
    .isMongoId().withMessage('Invalid booking ID'),

  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Reason cannot exceed 500 characters'),
];

export const disputeBookingValidator = [
  param('bookingId')
    .isMongoId().withMessage('Invalid booking ID'),

  body('reason')
    .notEmpty().withMessage('Dispute reason is required')
    .trim()
    .isLength({ max: 1000 }).withMessage('Reason cannot exceed 1000 characters'),
];

export const listBookingsValidator = [
  query('role')
    .optional()
    .isIn(['client', 'companion']).withMessage('Role must be client or companion'),

  query('status')
    .optional()
    .isIn(BOOKING_STATUS_ARRAY).withMessage(`Status must be one of: ${BOOKING_STATUS_ARRAY.join(', ')}`),

  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
];
