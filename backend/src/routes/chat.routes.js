/**
 * ==========================================================
 * FILE: src/routes/chat.routes.js
 * ==========================================================
 */

import { Router } from 'express';
import {
  getMyChats,
  getChatById,
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadCount,
} from '../controllers/chat.controller.js';

import {
  chatIdParamValidator,
  sendMessageValidator,
  getMessagesValidator,
} from '../validators/chat.validator.js';

import validate from '../middleware/validate.js';
import protect from '../middleware/auth.js';

const router = Router();

// All chat routes require authentication
router.use(protect);

// ── Chat List & Unread ──
router.get('/', getMyChats);
router.get('/unread/count', getUnreadCount);

// ── Single Chat ──
router.get('/:chatId', chatIdParamValidator, validate, getChatById);
router.patch('/:chatId/read', chatIdParamValidator, validate, markAsRead);

// ── Messages ──
router.get('/:chatId/messages', getMessagesValidator, validate, getMessages);
router.post('/:chatId/messages', sendMessageValidator, validate, sendMessage);

export default router;
