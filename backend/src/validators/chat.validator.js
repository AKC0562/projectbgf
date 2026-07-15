/**
 * ==========================================================
 * FILE: src/validators/chat.validator.js
 * ==========================================================
 */

import { body, param, query } from 'express-validator';

export const chatIdParamValidator = [
  param('chatId')
    .isMongoId().withMessage('Invalid chat ID'),
];

export const sendMessageValidator = [
  param('chatId')
    .isMongoId().withMessage('Invalid chat ID'),

  body('content')
    .notEmpty().withMessage('Message content is required')
    .trim()
    .isLength({ max: 2000 }).withMessage('Message cannot exceed 2000 characters'),

  body('type')
    .optional()
    .isIn(['text', 'image', 'system']).withMessage('Type must be text, image, or system'),
];

export const getMessagesValidator = [
  param('chatId')
    .isMongoId().withMessage('Invalid chat ID'),

  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
];
