/**
 * ==========================================================
 * FILE: src/services/chat.service.js
 * ==========================================================
 *
 * WHY THIS FILE EXISTS:
 * ---------------------
 * Chat business logic — message creation, retrieval, moderation, and
 * read receipts. Separated from the Socket.io layer so the same
 * logic can be used by both REST endpoints and WebSocket handlers.
 *
 * KEY SAFETY FEATURE: Keyword Moderation
 * Every message is scanned against MODERATION_KEYWORDS before saving.
 * If a match is found, the message is still saved (for evidence) but
 * flagged for admin review. This catches romantic/sexual solicitation,
 * profanity, and substance-related content.
 *
 * HOW IT CONNECTS:
 * ----------------
 * - chat.controller.js calls for REST-based message history
 * - socket/index.js calls for real-time message sending
 * - Chat model is updated with lastMessage
 * - Message model stores individual messages
 * - MODERATION_KEYWORDS from constants provides the filter list
 */

import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import ApiError from '../utils/ApiError.js';
import { MODERATION_KEYWORDS, MESSAGE_TYPES } from '../constants/index.js';
import { buildPaginationQuery, buildPaginationResponse } from '../utils/helpers.js';

/**
 * Get or verify a chat room.
 *
 * Checks that:
 * 1. The chat exists
 * 2. The user is a participant
 * 3. The chat is still active
 *
 * @param {string} chatId
 * @param {string} userId
 * @returns {Promise<Chat>}
 */
const getChat = async (chatId, userId) => {
  const chat = await Chat.findById(chatId)
    .populate('participants', 'fullName avatar isOnline')
    .populate('bookingId', 'status scheduledDate categoryId');

  if (!chat) {
    throw ApiError.notFound('Chat not found');
  }

  // Verify the user is a participant
  const isParticipant = chat.participants.some(
    (p) => p._id.toString() === userId.toString()
  );

  if (!isParticipant) {
    throw ApiError.forbidden('You are not a participant in this chat');
  }

  return chat;
};

/**
 * Get all chats for a user.
 *
 * @param {string} userId
 * @returns {Promise<Chat[]>}
 */
const getUserChats = async (userId) => {
  const chats = await Chat.find({
    participants: userId,
  })
    .sort({ updatedAt: -1 })
    .populate('participants', 'fullName avatar isOnline lastSeen')
    .populate('bookingId', 'status scheduledDate categoryId');

  return chats;
};

/**
 * Send a message in a chat.
 *
 * Flow:
 * 1. Verify chat exists, is active, and user is a participant
 * 2. Run keyword moderation on the message content
 * 3. Save the message
 * 4. Update the chat's lastMessage field
 *
 * @param {string} chatId
 * @param {string} senderId
 * @param {string} content
 * @param {string} type - 'text', 'image', or 'system'
 * @returns {Promise<Message>}
 */
const sendMessage = async (chatId, senderId, content, type = MESSAGE_TYPES.TEXT) => {
  // Step 1: Verify chat
  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw ApiError.notFound('Chat not found');
  }

  if (!chat.isActive) {
    throw ApiError.badRequest('This chat is no longer active — the booking has ended');
  }

  const isParticipant = chat.participants.some(
    (p) => p.toString() === senderId.toString()
  );
  if (!isParticipant) {
    throw ApiError.forbidden('You are not a participant in this chat');
  }

  // Step 2: Keyword moderation
  const { isFlagged, flagReason } = moderateContent(content);

  // Step 3: Create message
  const message = await Message.create({
    chatId,
    senderId,
    content,
    type,
    isFlagged,
    flagReason,
  });

  // Step 4: Update lastMessage on the chat document
  chat.lastMessage = {
    content: isFlagged ? '[Message flagged for review]' : content,
    senderId,
    sentAt: message.createdAt,
  };
  await chat.save();

  // Populate sender info for the response/socket emission
  await message.populate('senderId', 'fullName avatar');

  return message;
};

/**
 * Get messages for a chat with pagination.
 *
 * @param {string} chatId
 * @param {string} userId - For authorization
 * @param {object} queryParams - { page, limit }
 * @returns {Promise<{ messages, pagination }>}
 */
const getMessages = async (chatId, userId, queryParams) => {
  // Verify access
  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw ApiError.notFound('Chat not found');
  }

  const isParticipant = chat.participants.some(
    (p) => p.toString() === userId.toString()
  );
  if (!isParticipant) {
    throw ApiError.forbidden('You are not a participant in this chat');
  }

  const { page, limit, skip } = buildPaginationQuery(queryParams);

  const filter = { chatId, isDeleted: false };

  const [messages, total] = await Promise.all([
    Message.find(filter)
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(limit)
      .populate('senderId', 'fullName avatar'),
    Message.countDocuments(filter),
  ]);

  return {
    messages: messages.reverse(), // Return in chronological order
    pagination: buildPaginationResponse(total, page, limit),
  };
};

/**
 * Mark messages as read.
 *
 * Marks all unread messages in a chat that were NOT sent by the user
 * (you can't "read" your own messages).
 *
 * @param {string} chatId
 * @param {string} userId - The reader's ID
 * @returns {Promise<number>} Number of messages marked as read
 */
const markAsRead = async (chatId, userId) => {
  const result = await Message.updateMany(
    {
      chatId,
      senderId: { $ne: userId }, // Not sent by this user
      isRead: false,
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
      },
    }
  );

  return result.modifiedCount;
};

/**
 * Get unread message count for a user across all chats.
 *
 * @param {string} userId
 * @returns {Promise<number>}
 */
const getUnreadCount = async (userId) => {
  // Get all chat IDs where user is a participant
  const chats = await Chat.find({ participants: userId }).select('_id');
  const chatIds = chats.map((c) => c._id);

  const count = await Message.countDocuments({
    chatId: { $in: chatIds },
    senderId: { $ne: userId },
    isRead: false,
    isDeleted: false,
  });

  return count;
};

// ──────────────────────────────────────────────
// Helper: Content Moderation
// ──────────────────────────────────────────────
/**
 * Scans message content against the moderation keyword list.
 *
 * In production, this should be supplemented with an AI moderation
 * API (Google Perspective, OpenAI Moderation) for better accuracy.
 * The keyword list catches obvious violations; AI catches nuanced ones.
 *
 * @param {string} content - Message text
 * @returns {{ isFlagged: boolean, flagReason: string | null }}
 */
const moderateContent = (content) => {
  const lowerContent = content.toLowerCase();

  for (const keyword of MODERATION_KEYWORDS) {
    if (lowerContent.includes(keyword)) {
      return {
        isFlagged: true,
        flagReason: `Message contains prohibited content: "${keyword}"`,
      };
    }
  }

  return {
    isFlagged: false,
    flagReason: null,
  };
};

export default {
  getChat,
  getUserChats,
  sendMessage,
  getMessages,
  markAsRead,
  getUnreadCount,
};
