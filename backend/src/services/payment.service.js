/**
 * ==========================================================
 * FILE: src/services/payment.service.js
 * ==========================================================
 *
 * WHY THIS FILE EXISTS:
 * ---------------------
 * Handles the escrow payment lifecycle:
 * 1. Create Razorpay order when booking is confirmed
 * 2. Verify payment signature after client pays
 * 3. Hold funds in escrow during the booking
 * 4. Release to companion (minus platform fee) after completion
 * 5. Process refund on cancellation
 *
 * HOW IT CONNECTS:
 * ----------------
 * - booking.controller.js / booking.service.js calls these methods
 * - razorpay config provides the SDK instance
 * - Booking model stores payment IDs and status
 */

import crypto from 'crypto';
import razorpay from '../config/razorpay.js';
import Booking from '../models/Booking.js';
import ApiError from '../utils/ApiError.js';
import { PAYMENT_STATUS } from '../constants/index.js';

/**
 * Create a Razorpay order for a booking.
 *
 * @param {string} bookingId
 * @returns {Promise<object>} Razorpay order object
 */
const createOrder = async (bookingId, clientId) => {
  const booking = await Booking.findOne({ _id: bookingId, clientId });
  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  if (booking.paymentStatus !== PAYMENT_STATUS.PENDING) {
    throw ApiError.badRequest('Payment already initiated for this booking');
  }

  // Create Razorpay order
  const order = await razorpay.orders.create({
    amount: booking.totalAmount * 100, // Razorpay expects paisa (₹100 = 10000 paisa)
    currency: 'INR',
    receipt: booking._id.toString(),
    notes: {
      bookingId: booking._id.toString(),
      clientId: booking.clientId.toString(),
      companionId: booking.companionId.toString(),
    },
  });

  // Store Razorpay order ID on the booking
  booking.razorpayOrderId = order.id;
  await booking.save();

  return {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    bookingId: booking._id,
  };
};

/**
 * Verify Razorpay payment signature.
 *
 * Razorpay sends: orderId, paymentId, signature
 * We verify the signature using HMAC-SHA256 to confirm the payment
 * wasn't tampered with.
 *
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Razorpay signature
 * @returns {Promise<Booking>}
 */
const verifyPayment = async (orderId, paymentId, signature) => {
  // Generate expected signature
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
  const signatureBuffer = Buffer.from(signature, 'utf8');
  if (
    expectedBuffer.length !== signatureBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
  ) {
    throw ApiError.badRequest('Invalid payment signature — payment verification failed');
  }

  // Find and update booking
  const booking = await Booking.findOne({ razorpayOrderId: orderId });
  if (!booking) {
    throw ApiError.notFound('Booking not found for this order');
  }

  booking.razorpayPaymentId = paymentId;
  booking.paymentStatus = PAYMENT_STATUS.ESCROW;
  await booking.save();

  return booking;
};

/**
 * Release payment from escrow to companion.
 * Called after booking completion.
 *
 * In a production Razorpay Route integration, this would create a
 * transfer to the companion's linked account. For now, it updates
 * the payment status.
 *
 * @param {string} bookingId
 * @returns {Promise<Booking>}
 */
const releaseEscrow = async (bookingId) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  if (booking.paymentStatus !== PAYMENT_STATUS.ESCROW) {
    throw ApiError.badRequest('Payment is not in escrow');
  }

  // In production with Razorpay Route:
  // await razorpay.transfers.create({
  //   account: companionLinkedAccountId,
  //   amount: booking.companionEarnings * 100,
  //   currency: 'INR',
  //   on_hold: false,
  // });

  booking.paymentStatus = PAYMENT_STATUS.RELEASED;
  await booking.save();

  return booking;
};

/**
 * Process a refund for a cancelled booking.
 *
 * @param {string} bookingId
 * @returns {Promise<Booking>}
 */
const processRefund = async (bookingId) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  if (booking.paymentStatus !== PAYMENT_STATUS.ESCROW) {
    throw ApiError.badRequest('No escrow payment to refund');
  }

  // In production:
  // await razorpay.payments.refund(booking.razorpayPaymentId, {
  //   amount: booking.totalAmount * 100,
  //   speed: 'normal',
  //   notes: { reason: 'Booking cancelled' },
  // });

  booking.paymentStatus = PAYMENT_STATUS.REFUNDED;
  await booking.save();

  return booking;
};

export default {
  createOrder,
  verifyPayment,
  releaseEscrow,
  processRefund,
};
