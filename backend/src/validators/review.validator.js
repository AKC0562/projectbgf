/**
 * ==========================================================
 * FILE: src/validators/review.validator.js
 * ==========================================================
 */

import { body, param, query } from 'express-validator';
import { REVIEW_TAGS } from '../constants/index.js';

export const createReviewValidator = [
  body('bookingId')
    .notEmpty().withMessage('Booking ID is required')
    .isMongoId().withMessage('Invalid booking ID'),

  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),

  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters'),

  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),

  body('tags.*')
    .optional()
    .isIn(REVIEW_TAGS).withMessage(`Tag must be one of: ${REVIEW_TAGS.join(', ')}`),
];

export const getReviewsValidator = [
  param('userId')
    .isMongoId().withMessage('Invalid user ID'),

  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
];
