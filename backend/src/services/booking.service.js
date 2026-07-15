/**
 * ==========================================================
 * FILE: src/services/booking.service.js
 * ==========================================================
 *
 * WHY THIS FILE EXISTS:
 * ---------------------
 * The booking state machine is the most complex business logic in the app.
 * This service enforces:
 * 1. Valid state transitions (can't go from completed back to ongoing)
 * 2. Participant authorization (only the companion can accept)
 * 3. Availability validation
 * 4. Payment escrow lifecycle
 * 5. Chat room creation on acceptance
 * 6. Stats updates on completion
 *
 * HOW IT CONNECTS:
 * ----------------
 * - booking.controller.js calls these methods
 * - CompanionProfile is checked for rates and availability
 * - Chat is created when booking is accepted
 * - User stats (totalBookings, totalSpent, totalEarnings) are updated
 * - payment.service.js handles the financial side
 */

import Booking from '../models/Booking.js';
import CompanionProfile from '../models/CompanionProfile.js';
import Chat from '../models/Chat.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import ApiError from '../utils/ApiError.js';
import {
  BOOKING_STATUS,
  BOOKING_STATUS_TRANSITIONS,
  PAYMENT_STATUS,
  TRUST_SCORE,
} from '../constants/index.js';
import { buildPaginationQuery, buildPaginationResponse } from '../utils/helpers.js';

/**
 * Create a new booking request.
 *
 * Flow:
 * 1. Validate companion profile exists and is active
 * 2. Validate category exists
 * 3. Prevent self-booking
 * 4. Calculate pricing
 * 5. Create booking with status 'requested'
 *
 * @param {object} bookingData - { companionProfileId, categoryId, scheduledDate, scheduledStartTime, scheduledEndTime, venue, duration, notes }
 * @param {string} clientId - The client's userId
 * @returns {Promise<Booking>}
 */
const createBooking = async (bookingData, clientId) => {
  const {
    companionProfileId,
    categoryId,
    scheduledDate,
    scheduledStartTime,
    scheduledEndTime,
    venue,
    duration,
    notes,
  } = bookingData;

  // Step 1: Find companion profile
  const companionProfile = await CompanionProfile.findById(companionProfileId);
  if (!companionProfile) {
    throw ApiError.notFound('Companion profile not found');
  }

  if (!companionProfile.isActive) {
    throw ApiError.badRequest('This companion is currently unavailable');
  }

  // Step 2: Prevent self-booking
  if (companionProfile.userId.toString() === clientId.toString()) {
    throw ApiError.badRequest('You cannot book yourself');
  }

  // Step 3: Validate category
  const category = await Category.findById(categoryId);
  if (!category || !category.isActive) {
    throw ApiError.badRequest('Invalid or inactive category');
  }

  // Step 4: Check companion offers this category
  const offersCategory = companionProfile.categories.some(
    (c) => c.toString() === categoryId.toString()
  );
  if (!offersCategory) {
    throw ApiError.badRequest('This companion does not offer this activity');
  }

  // Step 5: Calculate pricing
  const hourlyRate = companionProfile.hourlyRate;
  const totalAmount = Math.round(hourlyRate * duration);

  // Step 6: Create booking
  const booking = await Booking.create({
    clientId,
    companionId: companionProfile.userId,
    companionProfileId,
    categoryId,
    status: BOOKING_STATUS.REQUESTED,
    scheduledDate: new Date(scheduledDate),
    scheduledStartTime,
    scheduledEndTime,
    venue,
    duration,
    hourlyRate,
    totalAmount,
    notes,
  });

  return booking;
};

/**
 * Accept a booking request (companion only).
 *
 * Creates a Chat room for communication between the parties.
 *
 * @param {string} bookingId
 * @param {string} companionUserId - The companion's userId (for authorization)
 * @returns {Promise<Booking>}
 */
const acceptBooking = async (bookingId, companionUserId) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  // Authorization: only the assigned companion can accept
  if (booking.companionId.toString() !== companionUserId.toString()) {
    throw ApiError.forbidden('Only the assigned companion can accept this booking');
  }

  // State transition validation
  validateStatusTransition(booking.status, BOOKING_STATUS.ACCEPTED);

  booking.status = BOOKING_STATUS.ACCEPTED;
  await booking.save();

  // Create a chat room for this booking
  await Chat.create({
    bookingId: booking._id,
    participants: [booking.clientId, booking.companionId],
  });

  return booking;
};

/**
 * Decline a booking (companion only). No penalty.
 *
 * @param {string} bookingId
 * @param {string} companionUserId
 * @param {string} reason - Optional reason for declining
 * @returns {Promise<Booking>}
 */
const declineBooking = async (bookingId, companionUserId, reason) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  if (booking.companionId.toString() !== companionUserId.toString()) {
    throw ApiError.forbidden('Only the assigned companion can decline this booking');
  }

  validateStatusTransition(booking.status, BOOKING_STATUS.CANCELLED);

  booking.status = BOOKING_STATUS.CANCELLED;
  booking.cancellationReason = reason || 'Declined by companion';
  booking.cancelledBy = companionUserId;
  booking.cancelledAt = new Date();

  await booking.save();

  return booking;
};

/**
 * Start a booking (move to 'ongoing').
 * Either party can trigger this.
 *
 * @param {string} bookingId
 * @param {string} userId - Must be either clientId or companionId
 * @returns {Promise<Booking>}
 */
const startBooking = async (bookingId, userId) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  // Only participants can start the booking
  if (
    booking.clientId.toString() !== userId.toString() &&
    booking.companionId.toString() !== userId.toString()
  ) {
    throw ApiError.forbidden('Only booking participants can start the booking');
  }

  validateStatusTransition(booking.status, BOOKING_STATUS.ONGOING);

  booking.status = BOOKING_STATUS.ONGOING;
  booking.actualStartTime = new Date();

  await booking.save();

  return booking;
};

/**
 * Complete a booking.
 * Either party can trigger this. Payment is released from escrow.
 *
 * @param {string} bookingId
 * @param {string} userId
 * @returns {Promise<Booking>}
 */
const completeBooking = async (bookingId, userId) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  if (
    booking.clientId.toString() !== userId.toString() &&
    booking.companionId.toString() !== userId.toString()
  ) {
    throw ApiError.forbidden('Only booking participants can complete the booking');
  }

  validateStatusTransition(booking.status, BOOKING_STATUS.COMPLETED);

  booking.status = BOOKING_STATUS.COMPLETED;
  booking.actualEndTime = new Date();
  booking.paymentStatus = PAYMENT_STATUS.RELEASED;

  await booking.save();

  // Update stats for both parties
  await Promise.all([
    User.findByIdAndUpdate(booking.clientId, {
      $inc: { totalBookings: 1, totalSpent: booking.totalAmount },
    }),
    User.findByIdAndUpdate(booking.companionId, {
      $inc: {
        totalBookings: 1,
        totalEarnings: booking.companionEarnings,
        trustScore: TRUST_SCORE.COMPLETED_BOOKING_BONUS,
      },
    }),
    CompanionProfile.findByIdAndUpdate(booking.companionProfileId, {
      $inc: { totalCompletedBookings: 1 },
    }),
  ]);

  // Deactivate the chat
  await Chat.findOneAndUpdate(
    { bookingId: booking._id },
    { isActive: false }
  );

  return booking;
};

/**
 * Cancel a booking (either party).
 *
 * @param {string} bookingId
 * @param {string} userId
 * @param {string} reason
 * @returns {Promise<Booking>}
 */
const cancelBooking = async (bookingId, userId, reason) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  if (
    booking.clientId.toString() !== userId.toString() &&
    booking.companionId.toString() !== userId.toString()
  ) {
    throw ApiError.forbidden('Only booking participants can cancel');
  }

  validateStatusTransition(booking.status, BOOKING_STATUS.CANCELLED);

  booking.status = BOOKING_STATUS.CANCELLED;
  booking.cancellationReason = reason;
  booking.cancelledBy = userId;
  booking.cancelledAt = new Date();

  // If payment was in escrow, mark for refund
  if (booking.paymentStatus === PAYMENT_STATUS.ESCROW) {
    booking.paymentStatus = PAYMENT_STATUS.REFUNDED;
  }

  await booking.save();

  // Apply trust score penalty to canceller
  await User.findByIdAndUpdate(userId, {
    $inc: { trustScore: TRUST_SCORE.CANCELLED_PENALTY },
  });

  // Deactivate the chat
  await Chat.findOneAndUpdate(
    { bookingId: booking._id },
    { isActive: false }
  );

  return booking;
};

/**
 * Dispute a booking (either party, while ongoing).
 *
 * @param {string} bookingId
 * @param {string} userId
 * @param {string} reason
 * @returns {Promise<Booking>}
 */
const disputeBooking = async (bookingId, userId, reason) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  if (
    booking.clientId.toString() !== userId.toString() &&
    booking.companionId.toString() !== userId.toString()
  ) {
    throw ApiError.forbidden('Only booking participants can dispute');
  }

  validateStatusTransition(booking.status, BOOKING_STATUS.DISPUTED);

  booking.status = BOOKING_STATUS.DISPUTED;
  booking.disputeReason = reason;
  booking.disputedBy = userId;
  booking.disputedAt = new Date();

  await booking.save();

  return booking;
};

/**
 * Get bookings for a user (as client or companion) with filters.
 *
 * @param {string} userId
 * @param {object} queryParams - { role, status, page, limit }
 * @returns {Promise<{ bookings, pagination }>}
 */
const getUserBookings = async (userId, queryParams) => {
  const { role, status } = queryParams;
  const { page, limit, skip } = buildPaginationQuery(queryParams);

  const filter = {};

  // Filter by role (am I the client or the companion?)
  if (role === 'companion') {
    filter.companionId = userId;
  } else {
    filter.clientId = userId;
  }

  // Filter by status
  if (status) {
    filter.status = status;
  }

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('clientId', 'fullName avatar')
      .populate('companionId', 'fullName avatar')
      .populate('categoryId', 'name slug icon')
      .populate('companionProfileId', 'displayName averageRating'),
    Booking.countDocuments(filter),
  ]);

  return {
    bookings,
    pagination: buildPaginationResponse(total, page, limit),
  };
};

/**
 * Get a single booking by ID.
 * Only accessible to participants or admin.
 *
 * @param {string} bookingId
 * @param {string} userId
 * @param {string} userRole
 * @returns {Promise<Booking>}
 */
const getBookingById = async (bookingId, userId, userRole) => {
  const booking = await Booking.findById(bookingId)
    .populate('clientId', 'fullName avatar phone email')
    .populate('companionId', 'fullName avatar phone email')
    .populate('categoryId', 'name slug icon')
    .populate('companionProfileId', 'displayName averageRating hourlyRate');

  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  // Only participants or admin can view
  if (
    userRole !== 'admin' &&
    booking.clientId._id.toString() !== userId.toString() &&
    booking.companionId._id.toString() !== userId.toString()
  ) {
    throw ApiError.forbidden('You are not authorized to view this booking');
  }

  return booking;
};

// ──────────────────────────────────────────────
// Helper: Validate State Transition
// ──────────────────────────────────────────────
/**
 * Checks if a status transition is valid according to the state machine.
 *
 * @param {string} currentStatus
 * @param {string} newStatus
 * @throws {ApiError} if transition is not allowed
 */
const validateStatusTransition = (currentStatus, newStatus) => {
  const allowedTransitions = BOOKING_STATUS_TRANSITIONS[currentStatus];

  if (!allowedTransitions || !allowedTransitions.includes(newStatus)) {
    throw ApiError.badRequest(
      `Cannot transition from '${currentStatus}' to '${newStatus}'`
    );
  }
};

export default {
  createBooking,
  acceptBooking,
  declineBooking,
  startBooking,
  completeBooking,
  cancelBooking,
  disputeBooking,
  getUserBookings,
  getBookingById,
};
