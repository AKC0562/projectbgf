/**
 * ==========================================================
 * FILE: src/services/otp.service.js
 * ==========================================================
 *
 * WHY THIS FILE EXISTS:
 * ---------------------
 * OTP (One-Time Password) is the primary authentication method for
 * Companion. Indian users expect phone-based OTP login (not email/password).
 *
 * This service handles:
 * 1. OTP generation (cryptographically secure 6-digit codes)
 * 2. OTP storage (in-memory Map with TTL — Redis-ready interface)
 * 3. OTP verification (with attempt tracking)
 * 4. Rate limiting (max OTPs per phone per hour)
 * 5. Cooldown enforcement (minimum time between OTP requests)
 *
 * WHY IN-MEMORY AND NOT A DATABASE?
 * OTPs are ephemeral (5 min lifespan). Storing them in MongoDB would:
 * - Add unnecessary DB writes for every login attempt
 * - Require a TTL index cleanup job
 * - Be slower than in-memory access
 *
 * The in-memory Map works perfectly for a single-server deployment.
 * For multi-server production, swap to Redis (same interface, just change
 * the storage backend). The service is designed with this migration in mind.
 *
 * HOW IT CONNECTS:
 * ----------------
 * - auth.service.js calls sendOTP() when user requests login
 * - auth.service.js calls verifyOTP() when user submits the code
 * - In production, sendOTP would integrate with SMS gateway (MSG91, Twilio)
 * - Currently logs OTP to console for development
 */

import { generateOTP } from '../utils/helpers.js';
import ApiError from '../utils/ApiError.js';

/**
 * In-memory OTP store.
 *
 * Key: phone number (string)
 * Value: {
 *   otp: string,           // The 6-digit code
 *   expiresAt: number,     // Unix timestamp when OTP expires
 *   attempts: number,      // Failed verification attempts
 *   createdAt: number,     // When this OTP was generated
 *   requestCount: number,  // How many OTPs sent to this phone in the window
 *   windowStart: number    // Start of the rate limit window
 * }
 *
 * In production, this would be a Redis hash with TTL.
 */
const otpStore = new Map();

// Configuration from environment (with sensible defaults)
const OTP_EXPIRY_MS = (parseInt(process.env.OTP_EXPIRY_MINUTES, 10) || 5) * 60 * 1000;
const MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS, 10) || 5;
const RESEND_COOLDOWN_MS = (parseInt(process.env.OTP_RESEND_COOLDOWN_SECONDS, 10) || 60) * 1000;
const MAX_REQUESTS_PER_HOUR = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

/**
 * Send an OTP to a phone number.
 *
 * Flow:
 * 1. Check rate limit (max 5 OTPs per phone per hour)
 * 2. Check cooldown (min 60 seconds between requests)
 * 3. Generate 6-digit OTP
 * 4. Store in memory with expiry
 * 5. Send via SMS gateway (or log in development)
 *
 * @param {string} phone - Indian phone number (10 digits)
 * @returns {{ message: string, expiresInSeconds: number }}
 * @throws {ApiError} 429 if rate limited or cooldown active
 */
const sendOTP = async (phone) => {
  const now = Date.now();
  const existing = otpStore.get(phone);

  // ── Rate Limit Check ──
  // Prevent OTP flooding: max 5 requests per phone per hour
  if (existing) {
    // Reset rate limit window if it's expired
    if (now - existing.windowStart > RATE_LIMIT_WINDOW_MS) {
      // Window expired — reset counter
      existing.requestCount = 0;
      existing.windowStart = now;
    }

    if (existing.requestCount >= MAX_REQUESTS_PER_HOUR) {
      throw ApiError.tooManyRequests(
        'Maximum OTP requests reached — please try again after 1 hour'
      );
    }

    // ── Cooldown Check ──
    // Prevent rapid-fire OTP requests
    const timeSinceLastRequest = now - existing.createdAt;
    if (timeSinceLastRequest < RESEND_COOLDOWN_MS) {
      const remainingSeconds = Math.ceil(
        (RESEND_COOLDOWN_MS - timeSinceLastRequest) / 1000
      );
      throw ApiError.tooManyRequests(
        `Please wait ${remainingSeconds} seconds before requesting a new OTP`
      );
    }
  }

  // ── Generate OTP ──
  const otp = generateOTP();

  // ── Store OTP ──
  otpStore.set(phone, {
    otp,
    expiresAt: now + OTP_EXPIRY_MS,
    attempts: 0,
    createdAt: now,
    requestCount: (existing?.requestCount || 0) + 1,
    windowStart: existing?.windowStart || now,
  });

  // ── Send OTP ──
  // In production, integrate with your SMS provider here:
  //   await msg91.sendOTP(phone, otp);
  //   await twilio.messages.create({ to: `+91${phone}`, body: `Your Companion OTP: ${otp}` });
  //
  // For development, we log it to console so you can test without an SMS provider
  if (process.env.NODE_ENV === 'development') {
    console.log(`──────── OTP for ${phone}: ${otp} ────────`);
  }

  // ── Auto-cleanup ──
  // Schedule deletion of this OTP after expiry to prevent memory leaks.
  // In production with Redis, you'd set a TTL on the key instead.
  setTimeout(() => {
    const stored = otpStore.get(phone);
    // Only delete if this is the same OTP (user might have requested a new one)
    if (stored && stored.otp === otp) {
      otpStore.delete(phone);
    }
  }, OTP_EXPIRY_MS);

  const expiresInSeconds = Math.floor(OTP_EXPIRY_MS / 1000);

  return {
    message: 'OTP sent successfully',
    expiresInSeconds,
  };
};

/**
 * Verify an OTP submitted by the user.
 *
 * Flow:
 * 1. Check if OTP exists for this phone
 * 2. Check if OTP has expired
 * 3. Check if max attempts exceeded
 * 4. Compare the submitted OTP with the stored one
 * 5. If valid: delete the OTP (single-use)
 * 6. If invalid: increment attempt counter
 *
 * @param {string} phone - Indian phone number (10 digits)
 * @param {string} otp - 6-digit OTP submitted by user
 * @returns {boolean} true if OTP is valid
 * @throws {ApiError} 400 if OTP is invalid, expired, or max attempts reached
 */
const verifyOTP = (phone, otp) => {
  const stored = otpStore.get(phone);

  // ── No OTP Found ──
  if (!stored) {
    throw ApiError.badRequest(
      'No OTP found for this phone number — please request a new one'
    );
  }

  // ── Expiry Check ──
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(phone);
    throw ApiError.badRequest('OTP has expired — please request a new one');
  }

  // ── Max Attempts Check ──
  if (stored.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(phone);
    throw ApiError.tooManyRequests(
      'Maximum verification attempts exceeded — please request a new OTP'
    );
  }

  // ── Compare OTP ──
  if (stored.otp !== otp) {
    // Increment attempt counter
    stored.attempts += 1;
    const remaining = MAX_ATTEMPTS - stored.attempts;
    throw ApiError.badRequest(
      `Invalid OTP — ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining`
    );
  }

  // ── OTP is Valid ──
  // Delete it immediately — OTPs are single-use
  otpStore.delete(phone);

  return true;
};

/**
 * Clean up all expired OTPs from the store.
 * Can be called periodically as a maintenance job.
 * In production with Redis TTL, this isn't needed.
 */
const cleanupExpiredOTPs = () => {
  const now = Date.now();
  let cleaned = 0;

  for (const [phone, data] of otpStore.entries()) {
    if (now > data.expiresAt) {
      otpStore.delete(phone);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`Cleaned up ${cleaned} expired OTP(s)`);
  }
};

// Run cleanup every 10 minutes to prevent memory leaks
setInterval(cleanupExpiredOTPs, 10 * 60 * 1000);

export default {
  sendOTP,
  verifyOTP,
  cleanupExpiredOTPs,
};
