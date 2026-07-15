/**
 * ==========================================================
 * FILE: src/controllers/booking.controller.js
 * ==========================================================
 *
 * WHY THIS FILE EXISTS:
 * ---------------------
 * Thin controller layer for booking operations. Extracts request data,
 * calls booking.service.js, and sends responses.
 *
 * HOW IT CONNECTS:
 * ----------------
 * - booking.routes.js maps endpoints here
 * - Delegates all logic to booking.service.js
 */

import bookingService from '../services/booking.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @route   POST /api/v1/bookings
 * @desc    Create a new booking request
 * @access  Private (KYC verified clients)
 */
export const createBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.createBooking(req.body, req.user._id);

  res.status(201).json(
    new ApiResponse(201, booking, 'Booking request created successfully')
  );
});

/**
 * @route   PATCH /api/v1/bookings/:bookingId/accept
 * @desc    Accept a booking (companion only)
 * @access  Private
 */
export const acceptBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.acceptBooking(
    req.params.bookingId,
    req.user._id
  );

  res.status(200).json(
    new ApiResponse(200, booking, 'Booking accepted — chat room created')
  );
});

/**
 * @route   PATCH /api/v1/bookings/:bookingId/decline
 * @desc    Decline a booking (companion only, no penalty)
 * @access  Private
 */
export const declineBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.declineBooking(
    req.params.bookingId,
    req.user._id,
    req.body.reason
  );

  res.status(200).json(
    new ApiResponse(200, booking, 'Booking declined')
  );
});

/**
 * @route   PATCH /api/v1/bookings/:bookingId/start
 * @desc    Start a booking (move to ongoing)
 * @access  Private
 */
export const startBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.startBooking(
    req.params.bookingId,
    req.user._id
  );

  res.status(200).json(
    new ApiResponse(200, booking, 'Booking started')
  );
});

/**
 * @route   PATCH /api/v1/bookings/:bookingId/complete
 * @desc    Complete a booking (release payment)
 * @access  Private
 */
export const completeBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.completeBooking(
    req.params.bookingId,
    req.user._id
  );

  res.status(200).json(
    new ApiResponse(200, booking, 'Booking completed — payment released')
  );
});

/**
 * @route   PATCH /api/v1/bookings/:bookingId/cancel
 * @desc    Cancel a booking
 * @access  Private
 */
export const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.cancelBooking(
    req.params.bookingId,
    req.user._id,
    req.body.reason
  );

  res.status(200).json(
    new ApiResponse(200, booking, 'Booking cancelled')
  );
});

/**
 * @route   PATCH /api/v1/bookings/:bookingId/dispute
 * @desc    Dispute a booking
 * @access  Private
 */
export const disputeBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.disputeBooking(
    req.params.bookingId,
    req.user._id,
    req.body.reason
  );

  res.status(200).json(
    new ApiResponse(200, booking, 'Booking disputed — admin will review')
  );
});

/**
 * @route   GET /api/v1/bookings
 * @desc    Get my bookings (as client or companion)
 * @access  Private
 */
export const getMyBookings = asyncHandler(async (req, res) => {
  const { bookings, pagination } = await bookingService.getUserBookings(
    req.user._id,
    req.query
  );

  res.status(200).json(
    ApiResponse.paginated(bookings, pagination, 'Bookings fetched')
  );
});

/**
 * @route   GET /api/v1/bookings/:bookingId
 * @desc    Get booking details
 * @access  Private (participants or admin)
 */
export const getBookingById = asyncHandler(async (req, res) => {
  const booking = await bookingService.getBookingById(
    req.params.bookingId,
    req.user._id,
    req.user.role
  );

  res.status(200).json(
    new ApiResponse(200, booking, 'Booking details fetched')
  );
});
