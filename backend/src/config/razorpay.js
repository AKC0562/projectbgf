/**
 * ==========================================================
 * FILE: src/config/razorpay.js
 * ==========================================================
 *
 * WHY THIS FILE EXISTS:
 * ---------------------
 * Companion uses an escrow-based payment flow: when a client books a
 * companion, the payment is captured immediately but held (escrow) until
 * the booking is completed. Only then is the companion's share (80%)
 * released via Razorpay Route (split payments).
 *
 * This file creates a single Razorpay SDK instance configured with the
 * merchant's API credentials. Every payment operation (order creation,
 * signature verification, refunds, transfers) imports this instance.
 *
 * HOW IT CONNECTS:
 * ----------------
 * - payment.service.js uses it for:
 *   - createOrder() → Razorpay Orders API
 *   - verifyPayment() → signature validation
 *   - releaseEscrow() → Route transfer API
 *   - processRefund() → Refunds API
 * - booking.service.js calls payment.service after status transitions
 *
 * PREREQUISITES:
 * - Razorpay account with Route enabled (for split payments)
 * - API Key ID and Key Secret in .env
 */

import Razorpay from 'razorpay';

/**
 * Razorpay SDK instance.
 *
 * IMPORTANT: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in .env.
 * The app will start without them, but payment operations will fail at
 * runtime. This is intentional — it allows development of non-payment
 * features without Razorpay credentials.
 */
let razorpay;

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (keyId && keySecret) {
  razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
  console.log('✓ Razorpay SDK initialized');
} else {
  console.warn('⚠ Razorpay credentials not configured — payment features will be unavailable');
  // Create a proxy that throws a clear error on any method call
  razorpay = new Proxy(
    {},
    {
      get(target, prop) {
        if (prop === 'then' || typeof prop === 'symbol') return undefined;
        return new Proxy(() => {}, {
          get() {
            throw new Error(
              'Razorpay is not configured — set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env'
            );
          },
          apply() {
            throw new Error(
              'Razorpay is not configured — set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env'
            );
          },
        });
      },
    }
  );
}

export default razorpay;
