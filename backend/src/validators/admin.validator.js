/**
 * ==========================================================
 * FILE: src/validators/admin.validator.js
 * ==========================================================
 */

import { body, param, query } from 'express-validator';
import {
  USER_ROLES_ARRAY,
  KYC_STATUS_ARRAY,
  BOOKING_STATUS_ARRAY,
  REPORT_STATUS_ARRAY,
} from '../constants/index.js';

export const listUsersValidator = [
  query('role').optional().isIn(USER_ROLES_ARRAY).withMessage('Invalid role'),
  query('kycStatus').optional().isIn(KYC_STATUS_ARRAY).withMessage('Invalid KYC status'),
  query('search').optional().isString(),
  query('isBanned').optional().isIn(['true', 'false']).withMessage('isBanned must be true or false'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

export const banUserValidator = [
  param('userId').isMongoId().withMessage('Invalid user ID'),
  body('reason').notEmpty().withMessage('Ban reason is required')
    .trim().isLength({ max: 500 }).withMessage('Reason cannot exceed 500 characters'),
];

export const userIdParamValidator = [
  param('userId').isMongoId().withMessage('Invalid user ID'),
];

export const kycActionValidator = [
  param('userId').isMongoId().withMessage('Invalid user ID'),
];

export const rejectKYCValidator = [
  param('userId').isMongoId().withMessage('Invalid user ID'),
  body('reason').notEmpty().withMessage('Rejection reason is required')
    .trim().isLength({ max: 500 }).withMessage('Reason cannot exceed 500 characters'),
];

export const listBookingsValidator = [
  query('status').optional().isIn(BOOKING_STATUS_ARRAY).withMessage('Invalid booking status'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

export const resolveDisputeValidator = [
  param('bookingId').isMongoId().withMessage('Invalid booking ID'),
  body('resolution').notEmpty().withMessage('Resolution is required')
    .isIn(['completed', 'cancelled']).withMessage('Resolution must be completed or cancelled'),
  body('adminNotes').optional().trim().isLength({ max: 1000 }),
];

export const listReportsValidator = [
  query('status').optional().isIn(REPORT_STATUS_ARRAY).withMessage('Invalid report status'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

export const resolveReportValidator = [
  param('reportId').isMongoId().withMessage('Invalid report ID'),
  body('status').notEmpty().withMessage('Status is required')
    .isIn(REPORT_STATUS_ARRAY).withMessage('Invalid status'),
  body('adminNotes').optional().trim().isLength({ max: 1000 }),
];

export const createCategoryValidator = [
  body('name').notEmpty().withMessage('Category name is required')
    .trim().isLength({ max: 100 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('icon').optional().trim(),
  body('sortOrder').optional().isInt({ min: 0 }),
];

export const updateCategoryValidator = [
  param('categoryId').isMongoId().withMessage('Invalid category ID'),
  body('name').optional().trim().isLength({ max: 100 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('icon').optional().trim(),
  body('isActive').optional().isBoolean(),
  body('sortOrder').optional().isInt({ min: 0 }),
];

export const analyticsValidator = [
  query('period').optional().isIn(['week', 'month', 'year']).withMessage('Period must be week, month, or year'),
];
