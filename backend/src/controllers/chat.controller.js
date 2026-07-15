/**
 * ==========================================================
 * FILE: src/controllers/chat.controller.js
 * ==========================================================
 *
 * WHY THIS FILE EXISTS:
 * ---------------------
 * REST endpoints for chat operations. While real-time messaging uses
 * Socket.io, REST is needed for:
 * - Loading message history (pagination)
 * - Getting chat list
 * - Getting unread counts
 *
 * HOW IT CONNECTS:
 * ----------------
 * - chat.routes.js maps endpoints here
 * - Delegates to chat.service.js
 * - Socket.io handles the real-time side (socket/index.js)
 */

import chatService from '../services/chat.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @route   GET /api/v1/chats
 * @desc    Get all my chats
 * @access  Private
 */
export const getMyChats = asyncHandler(async (req, res) => {
  const chats = await chatService.getUserChats(req.user._id);

  res.status(200).json(
    new ApiResponse(200, chats, 'Chats fetched')
  );
});

/**
 * @route   GET /api/v1/chats/:chatId
 * @desc    Get chat details
 * @access  Private (participants only)
 */
export const getChatById = asyncHandler(async (req, res) => {
  const chat = await chatService.getChat(req.params.chatId, req.user._id);

  res.status(200).json(
    new ApiResponse(200, chat, 'Chat fetched')
  );
});

/**
 * @route   GET /api/v1/chats/:chatId/messages
 * @desc    Get messages for a chat (paginated)
 * @access  Private (participants only)
 */
export const getMessages = asyncHandler(async (req, res) => {
  const { messages, pagination } = await chatService.getMessages(
    req.params.chatId,
    req.user._id,
    req.query
  );

  res.status(200).json(
    ApiResponse.paginated(messages, pagination, 'Messages fetched')
  );
});

/**
 * @route   POST /api/v1/chats/:chatId/messages
 * @desc    Send a message (REST fallback — prefer Socket.io)
 * @access  Private (participants only)
 */
export const sendMessage = asyncHandler(async (req, res) => {
  const message = await chatService.sendMessage(
    req.params.chatId,
    req.user._id,
    req.body.content,
    req.body.type
  );

  res.status(201).json(
    new ApiResponse(201, message, 'Message sent')
  );
});

/**
 * @route   PATCH /api/v1/chats/:chatId/read
 * @desc    Mark all messages in a chat as read
 * @access  Private
 */
export const markAsRead = asyncHandler(async (req, res) => {
  const count = await chatService.markAsRead(req.params.chatId, req.user._id);

  res.status(200).json(
    new ApiResponse(200, { markedAsRead: count }, 'Messages marked as read')
  );
});

/**
 * @route   GET /api/v1/chats/unread/count
 * @desc    Get total unread message count
 * @access  Private
 */
export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await chatService.getUnreadCount(req.user._id);

  res.status(200).json(
    new ApiResponse(200, { unreadCount: count }, 'Unread count fetched')
  );
});
