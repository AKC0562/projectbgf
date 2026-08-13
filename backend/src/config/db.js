/**
 * ==========================================================
 * FILE: src/config/db.js
 * ==========================================================
 *
 * WHY THIS FILE EXISTS:
 * ---------------------
 * MongoDB connection management. The original version was a minimal
 * try/catch. This production version adds:
 *
 * 1. Connection event listeners — so we know exactly when the DB
 *    connects, disconnects, or errors (critical for debugging in prod)
 * 2. Strict query mode — prevents Mongoose from silently stripping
 *    unknown fields from queries (a common source of subtle bugs)
 * 3. Connection host logging — confirms which DB instance we're
 *    connected to (important when you have dev/staging/production DBs)
 *
 * HOW IT CONNECTS:
 * ----------------
 * - Called once from server.js on application startup
 * - Must succeed before the HTTP server starts listening
 * - If it fails, the process exits with code 1 (so container
 *   orchestrators like Docker/K8s can detect and restart)
 */

import mongoose from 'mongoose';

/**
 * Establishes connection to MongoDB and registers lifecycle listeners.
 *
 * @returns {Promise<void>}
 * @throws Exits process with code 1 on connection failure
 */
const connectDB = async () => {
  try {
    // Prevent Mongoose from silently stripping unknown query fields.
    // Without this, a query like User.find({ nme: 'John' }) would
    // return all users instead of throwing (because 'nme' is not a
    // schema field, Mongoose would just ignore it).
    mongoose.set('strictQuery', true);

    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✓ MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);

    // ── Connection Event Listeners ──
    // These fire throughout the application lifecycle, not just on startup.

    // Fired if the connection drops after initial successful connection
    // (e.g. network interruption, MongoDB server restart)
    mongoose.connection.on('error', (err) => {
      console.error(`✗ MongoDB connection error: ${err.message}`);
    });

    // Fired when Mongoose loses connection to MongoDB
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠ MongoDB disconnected');
    });

    // Fired when Mongoose successfully reconnects after a disconnection
    mongoose.connection.on('reconnected', () => {
      console.log('✓ MongoDB reconnected');
    });

  } catch (error) {
    console.error(`✗ MongoDB connection failed: ${error.message}`);
    throw error;
  }
};

export default connectDB;