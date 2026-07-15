/**
 * ==========================================================
 * FILE: src/validators/report.validator.js
 * ==========================================================
 */

import { body, query } from 'express-validator';
import { REPORT_REASONS_ARRAY } from '../constants/index.js';

export const createReportValidator = [
  body('reportedUserId')
    .notEmpty().withMessage('Reported user ID is required')
    .isMongoId().withMessage('Invalid user ID'),

  body('bookingId')
    .optional()
    .isMongoId().withMessage('Invalid booking ID'),

  body('reason')
    .notEmpty().withMessage('Report reason is required')
    .isIn(REPORT_REASONS_ARRAY)
    .withMessage(`Reason must be one of: ${REPORT_REASONS_ARRAY.join(', ')}`),

  body('description')
    .notEmpty().withMessage('Description is required')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),

  body('evidence')
    .optional()
    .isArray({ max: 5 }).withMessage('Maximum 5 evidence files'),

  body('evidence.*.url')
    .optional()
    .isURL().withMessage('Evidence URL must be valid'),

  body('evidence.*.publicId')
    .optional()
    .isString().withMessage('Evidence publicId must be a string'),
];

export const listReportsValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be positive'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
];
