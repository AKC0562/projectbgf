/**
 * ==========================================================
 * FILE: src/routes/booking.routes.js
 * ==========================================================
 */

import { Router } from 'express';
import {
  createBooking,
  acceptBooking,
  declineBooking,
  startBooking,
  completeBooking,
  cancelBooking,
  disputeBooking,
  getMyBookings,
  getBookingById,
} from '../controllers/booking.controller.js';

import {
  createBookingValidator,
  bookingIdParamValidator,
  cancelBookingValidator,
  disputeBookingValidator,
  listBookingsValidator,
} from '../validators/booking.validator.js';

import validate from '../middleware/validate.js';
import protect from '../middleware/auth.js';
import kycRequired from '../middleware/kycRequired.js';

const router = Router();

// All booking routes require authentication
router.use(protect);

// ── CRUD ──
router.post('/', kycRequired, createBookingValidator, validate, createBooking);
router.get('/', listBookingsValidator, validate, getMyBookings);
router.get('/:bookingId', bookingIdParamValidator, validate, getBookingById);

// ── State Transitions ──
router.patch('/:bookingId/accept', bookingIdParamValidator, validate, acceptBooking);
router.patch('/:bookingId/decline', bookingIdParamValidator, validate, declineBooking);
router.patch('/:bookingId/start', bookingIdParamValidator, validate, startBooking);
router.patch('/:bookingId/complete', bookingIdParamValidator, validate, completeBooking);
router.patch('/:bookingId/cancel', cancelBookingValidator, validate, cancelBooking);
router.patch('/:bookingId/dispute', disputeBookingValidator, validate, disputeBooking);

export default router;
