/**
 * ==========================================================
 * FILE: src/middleware/kycRequired.js
 * ==========================================================
 *
 * WHY THIS FILE EXISTS:
 * ---------------------
 * Safety is the #1 priority for Companion. Before any real-world meetup
 * can happen (booking), both parties must have completed KYC (Know Your
 * Customer) verification.
 *
 * This middleware gates booking-related endpoints:
 *   router.post('/bookings', protect, kycRequired, createBooking)
 *
 * If the user's KYC status is anything other than 'verified', they get
 * a 403 Forbidden with a helpful message explaining what to do.
 *
 * HOW IT CONNECTS:
 * ----------------
 * - Runs AFTER auth.js (depends on req.user)
 * - Used before booking creation, companion profile activation
 * - KYC status is updated by admin.service.js when admin reviews documents
 * - User model stores kycStatus field
 */

import { KYC_STATUS } from '../constants/index.js';
import ApiError from '../utils/ApiError.js';

/**
 * KYC verification middleware.
 *
 * Blocks the request if the user's KYC is not verified.
 * Provides context-specific messages for each KYC state.
 *
 * @param {import('express').Request} req - Must have req.user (from auth.js)
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const kycRequired = (req, res, next) => {
  if (!req.user) {
    throw ApiError.unauthorized('Authentication required');
  }

  const { kycStatus } = req.user;

  // If verified, allow the request to proceed
  if (kycStatus === KYC_STATUS.VERIFIED) {
    return next();
  }

  // Provide specific messages for each non-verified state
  const messages = {
    [KYC_STATUS.NOT_SUBMITTED]:
      'KYC verification required — please submit your identity documents to create bookings',
    [KYC_STATUS.PENDING]:
      'Your KYC documents are under review — please wait for verification before creating bookings',
    [KYC_STATUS.REJECTED]:
      'Your KYC verification was rejected — please re-submit with valid documents',
  };

  const message = messages[kycStatus] || 'KYC verification required';
  throw ApiError.forbidden(message);
};

export default kycRequired;
