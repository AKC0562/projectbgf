/**
 * ==========================================================
 * FILE: src/models/Chat.js
 * ==========================================================
 *
 * WHY THIS FILE EXISTS:
 * ---------------------
 * Chat rooms are created ONLY when a booking is accepted — there is
 * no free messaging between strangers. This is a safety design decision
 * that prevents unsolicited contact.
 *
 * Each Chat is tied 1:1 to a Booking. When the booking ends, the chat
 * becomes inactive (read-only archive). Messages are stored in a
 * separate Message model for scalability.
 *
 * HOW IT CONNECTS:
 * ----------------
 * - Created by booking.service.js when a booking is accepted
 * - Message model references chatId
 * - Socket.io uses chatId as the room identifier
 * - chat.controller.js handles REST endpoints for message history
 */

import mongoose from 'mongoose';

const { Schema } = mongoose;

const chatSchema = new Schema(
  {
    // 1:1 relationship with Booking — each booking gets one chat room
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking ID is required'],
      unique: true,
    },

    // Always exactly 2 participants: client + companion
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],

    // Denormalized last message for chat list display.
    // Without this, displaying a list of chats would require a
    // separate query per chat to find the most recent message.
    lastMessage: {
      content: { type: String },
      senderId: { type: Schema.Types.ObjectId, ref: 'User' },
      sentAt: { type: Date },
    },

    // Chat is active only during the booking lifecycle
    // (from accepted through completed/cancelled)
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ──
chatSchema.index({ participants: 1 }); // Find chats by user

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
