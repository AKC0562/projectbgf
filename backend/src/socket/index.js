/**
 * ==========================================================
 * FILE: src/socket/index.js
 * ==========================================================
 *
 * WHY THIS FILE EXISTS:
 * ---------------------
 * Socket.io provides real-time bidirectional communication for:
 * 1. Chat messages — instant delivery without polling
 * 2. Typing indicators — "User is typing..."
 * 3. Online status — live presence tracking
 * 4. Read receipts — "Message seen" notifications
 * 5. Booking notifications — real-time status updates
 *
 * AUTHENTICATION:
 * Socket.io connections are authenticated using JWT on the handshake.
 * The client sends the access token in the auth field:
 *   io.connect('http://localhost:5000', { auth: { token: 'Bearer ...' } })
 *
 * If the token is invalid, the connection is rejected.
 *
 * ROOM STRATEGY:
 * - Each chat has its own room (room ID = chatId)
 * - Users join rooms when they open a chat
 * - Messages are broadcast only to room members
 * - Each user also has a personal room (room ID = userId) for
 *   notifications that should reach them regardless of which chat is open
 *
 * HOW IT CONNECTS:
 * ----------------
 * - server.js passes the HTTP server to initializeSocket()
 * - JWT verification reuses the same secret as auth middleware
 * - chat.service.js is called for message persistence and moderation
 * - User model is updated for online/offline status
 */

import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import chatService from '../services/chat.service.js';

/**
 * Map of userId → Set<socketId> to track which sockets belong to
 * which user. A user can have multiple sockets (multiple browser tabs,
 * phone + laptop).
 */
const onlineUsers = new Map();

/**
 * Initialize Socket.io on the HTTP server.
 *
 * @param {import('http').Server} httpServer - The HTTP server from server.js
 * @returns {Server} The Socket.io server instance
 */
const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    // Ping every 25 seconds, timeout after 60 seconds of no response
    pingInterval: 25000,
    pingTimeout: 60000,
  });

  // ──────────────────────────────────────────
  // Authentication Middleware
  // ──────────────────────────────────────────
  /**
   * Verify JWT before allowing the WebSocket connection.
   * This runs once per connection attempt (not per message).
   */
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error('Authentication required'));
      }

      // Remove 'Bearer ' prefix if present
      const cleanToken = token.startsWith('Bearer ')
        ? token.slice(7)
        : token;

      const decoded = jwt.verify(cleanToken, process.env.JWT_ACCESS_SECRET);

      const user = await User.findById(decoded.userId).select(
        'fullName avatar role isBanned'
      );

      if (!user) {
        return next(new Error('User not found'));
      }

      if (user.isBanned) {
        return next(new Error('Account suspended'));
      }

      // Attach user data to the socket for use in event handlers
      socket.userId = decoded.userId;
      socket.user = user;

      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  // ──────────────────────────────────────────
  // Connection Handler
  // ──────────────────────────────────────────
  io.on('connection', (socket) => {
    const userId = socket.userId;

    console.log(`⚡ Socket connected: ${socket.user.fullName} (${userId})`);

    // ── Track Online Status ──
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Update user's online status in DB
    User.findByIdAndUpdate(userId, {
      isOnline: true,
      lastSeen: new Date(),
    }).catch(() => {}); // Fire and forget

    // Join personal room for direct notifications
    socket.join(userId);

    // ──────────────────────────────────────
    // Event: Join a Chat Room
    // ──────────────────────────────────────
    socket.on('join-chat', async (chatId) => {
      try {
        // Verify the user is a participant in this chat
        await chatService.getChat(chatId, userId);

        socket.join(chatId);
        console.log(`  → ${socket.user.fullName} joined chat ${chatId}`);
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // ──────────────────────────────────────
    // Event: Leave a Chat Room
    // ──────────────────────────────────────
    socket.on('leave-chat', (chatId) => {
      socket.leave(chatId);
    });

    // ──────────────────────────────────────
    // Event: Send a Message
    // ──────────────────────────────────────
    socket.on('send-message', async ({ chatId, content, type }) => {
      try {
        // chat.service handles validation, moderation, and persistence
        const message = await chatService.sendMessage(
          chatId,
          userId,
          content,
          type
        );

        // Broadcast to all users in the chat room (including sender)
        io.to(chatId).emit('new-message', {
          message,
          chatId,
        });

        // If message was flagged, notify (could extend to notify admin)
        if (message.isFlagged) {
          socket.emit('message-flagged', {
            messageId: message._id,
            reason: message.flagReason,
          });
        }
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // ──────────────────────────────────────
    // Event: Typing Indicator
    // ──────────────────────────────────────
    socket.on('typing', ({ chatId }) => {
      // Broadcast to everyone in the room EXCEPT the sender
      socket.to(chatId).emit('user-typing', {
        userId,
        fullName: socket.user.fullName,
      });
    });

    socket.on('stop-typing', ({ chatId }) => {
      socket.to(chatId).emit('user-stop-typing', { userId });
    });

    // ──────────────────────────────────────
    // Event: Read Receipts
    // ──────────────────────────────────────
    socket.on('mark-read', async ({ chatId }) => {
      try {
        await chatService.markAsRead(chatId, userId);

        // Notify the other participant that messages were read
        socket.to(chatId).emit('messages-read', {
          chatId,
          readBy: userId,
          readAt: new Date(),
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // ──────────────────────────────────────
    // Event: Disconnect
    // ──────────────────────────────────────
    socket.on('disconnect', () => {
      console.log(`⚡ Socket disconnected: ${socket.user.fullName}`);

      // Remove this socket from the user's socket set
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);

        // If no more sockets, the user is truly offline
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);

          // Update offline status in DB
          User.findByIdAndUpdate(userId, {
            isOnline: false,
            lastSeen: new Date(),
          }).catch(() => {});

          // Broadcast offline status to relevant users
          io.emit('user-offline', { userId });
        }
      }
    });
  });

  console.log('✓ Socket.io initialized');

  return io;
};

/**
 * Check if a user is currently online.
 * Can be called from other services for presence checks.
 *
 * @param {string} userId
 * @returns {boolean}
 */
export const isUserOnline = (userId) => {
  return onlineUsers.has(userId) && onlineUsers.get(userId).size > 0;
};

export default initializeSocket;
