/**
 * ==========================================================
 * FILE: src/app.js
 * ==========================================================
 *
 * WHY THIS FILE EXISTS:
 * ---------------------
 * Express application factory — configures all middleware and mounts
 * all route modules. Separated from server.js for testability and
 * Socket.io compatibility.
 *
 * MIDDLEWARE ORDER:
 * 1. Security (helmet, cors)
 * 2. Parsing (json, urlencoded, cookie-parser)
 * 3. Logging (morgan)
 * 4. Rate limiting (global)
 * 5. API Routes (all /api/v1/* endpoints)
 * 6. 404 handler
 * 7. Error handler
 *
 * HOW IT CONNECTS:
 * ----------------
 * - Imported by server.js → wrapped in http.createServer
 * - All route files are mounted under /api/v1 prefix
 * - Error handlers are registered last (Express requirement)
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

// Middleware
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';
import { globalLimiter } from './middleware/rateLimiter.js';

// Route Modules
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import companionRoutes from './routes/companion.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import chatRoutes from './routes/chat.routes.js';
import reviewRoutes from './routes/review.routes.js';
import reportRoutes from './routes/report.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app = express();

// ──────────────────────────────────────────────
// 1. Security Middleware
// ──────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ──────────────────────────────────────────────
// 2. Body Parsing
// ──────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ──────────────────────────────────────────────
// 3. Logging
// ──────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ──────────────────────────────────────────────
// 4. Rate Limiting
// ──────────────────────────────────────────────
app.use(globalLimiter);

// ──────────────────────────────────────────────
// 5. Health Check
// ──────────────────────────────────────────────
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Companion API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ──────────────────────────────────────────────
// 6. API Routes
// ──────────────────────────────────────────────
/**
 * Route mounting — each module handles its own sub-routes.
 *
 * Example: authRoutes contains POST /send-otp
 * → Full path becomes: POST /api/v1/auth/send-otp
 *
 * Route map:
 *   /api/v1/auth       → Authentication (login, register, OTP, tokens)
 *   /api/v1/users      → User self-management (profile, photos, settings)
 *   /api/v1/companions → Companion profiles and discovery/search
 *   /api/v1/bookings   → Booking lifecycle (create, accept, complete, etc.)
 *   /api/v1/chats      → Chat rooms and messages
 *   /api/v1/reviews    → Two-way review system
 *   /api/v1/reports    → Safety reports and SOS
 *   /api/v1/payments   → Razorpay orders, verification, webhooks
 *   /api/v1/admin      → Admin panel APIs (dashboard, KYC, moderation)
 */
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/companions', companionRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/chats', chatRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/admin', adminRoutes);

// ──────────────────────────────────────────────
// 7. Error Handling (MUST be last)
// ──────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
