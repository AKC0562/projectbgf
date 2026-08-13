/**
 * ==========================================================
 * FILE: server.js
 * ==========================================================
 *
 * Application entry point. Responsibilities:
 * 1. Load environment variables FIRST
 * 2. Connect to MongoDB
 * 3. Create HTTP server (for Socket.io compatibility)
 * 4. Initialize Socket.io
 * 5. Start listening
 * 6. Handle graceful shutdown
 * 7. Handle unhandled errors
 */

import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './src/app.js';
import connectDB from './src/config/db.js';
import initializeSocket from './src/socket/index.js';

const PORT = parseInt(process.env.PORT, 10) || 5000;

const validateEnvironment = () => {
  const required = ['MONGODB_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
  if (process.env.NODE_ENV === 'production') {
    required.push('RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'RAZORPAY_WEBHOOK_SECRET');
  }
  const missing = required.filter((name) => !process.env[name]);

  if (process.env.NODE_ENV === 'production' && missing.length > 0) {
    throw new Error(`Missing required production environment variables: ${missing.join(', ')}`);
  }
};

/**
 * Create HTTP server wrapping the Express app.
 * Needed for Socket.io — it attaches to the HTTP server, not the Express app.
 */
const server = http.createServer(app);

/**
 * Start the application.
 */
const startServer = async () => {
  try {
    validateEnvironment();

    // Step 1: Connect to MongoDB
    await connectDB();

    // Step 2: Initialize Socket.io
    initializeSocket(server);

    // Step 3: Start HTTP Server
    server.listen(PORT, () => {
      console.log(`✓ Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`  Health check: http://localhost:${PORT}/api/v1/health`);
      console.log(`  API base URL: http://localhost:${PORT}/api/v1`);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error.message);
    process.exit(1);
  }
};

// ──────────────────────────────────────────────
// Graceful Shutdown
// ──────────────────────────────────────────────
const gracefulShutdown = (signal) => {
  console.log(`\n⚠ Received ${signal}. Starting graceful shutdown...`);

  server.close(async () => {
    console.log('  ✓ HTTP server closed');

    try {
      const mongoose = await import('mongoose');
      await mongoose.default.connection.close();
      console.log('  ✓ MongoDB connection closed');
    } catch (err) {
      console.error('  ✗ Error closing MongoDB:', err.message);
    }

    console.log('  ✓ Shutdown complete');
    process.exit(0);
  });

  const forceShutdownTimer = setTimeout(() => {
    console.error('  ✗ Forced shutdown — timeout');
    process.exit(1);
  }, 10000);

  forceShutdownTimer.unref();
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION:', error);
  gracefulShutdown('uncaughtException');
});

startServer();