/**
 * ==========================================================
 * FILE: src/models/Message.js
 * ==========================================================
 *
 * WHY THIS FILE EXISTS:
 * ---------------------
 * Individual chat messages. Separated from Chat for scalability —
 * a single chat can have thousands of messages. If messages were
 * embedded in the Chat document, we'd hit MongoDB's 16MB document
 * size limit quickly.
 *
 * Safety features:
 * - isFlagged: automatically set by keyword moderation
 * - flagReason: explains why the message was flagged
 * - isDeleted: soft-delete support
 *
 * HOW IT CONNECTS:
 * ----------------
 * - References Chat model (chatId)
 * - chat.service.js creates messages
 * - Socket.io emits new messages in real-time
 * - Keyword moderation runs before message creation
 * - Flagged messages are visible to admins for review
 */

import mongoose from 'mongoose';
import { MESSAGE_TYPES, MESSAGE_TYPES_ARRAY } from '../constants/index.js';

const { Schema } = mongoose;

const messageSchema = new Schema(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      ref: 'Chat',
      required: [true, 'Chat ID is required'],
    },

    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender ID is required'],
    },

    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },

    type: {
      type: String,
      enum: {
        values: MESSAGE_TYPES_ARRAY,
        message: 'Message type must be one of: {VALUE}',
      },
      default: MESSAGE_TYPES.TEXT,
    },

    // ── Moderation ──
    isFlagged: {
      type: Boolean,
      default: false,
    },

    flagReason: {
      type: String,
      trim: true,
    },

    // ── Read Status ──
    isRead: {
      type: Boolean,
      default: false,
    },

    readAt: {
      type: Date,
    },

    // ── Soft Delete ──
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──
// Primary query: get messages for a chat, sorted by time
messageSchema.index({ chatId: 1, createdAt: 1 });

// Moderation: find flagged messages across all chats
messageSchema.index({ isFlagged: 1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;
