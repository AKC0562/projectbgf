/**
 * ==========================================================
 * FILE: src/models/Booking.js
 * ==========================================================
 *
 * WHY THIS FILE EXISTS:
 * ---------------------
 * The Booking model is the CORE TRANSACTION of the Companion platform.
 * It represents a scheduled meeting between a client and a companion
 * for a specific activity at a specific venue.
 *
 * The booking lifecycle is a state machine:
 *   requested → accepted → ongoing → completed
 *                    ↘ cancelled
 *                         ongoing → disputed → completed/cancelled
 *
 * Key design decisions:
 * 1. ESCROW PAYMENTS — money is captured on booking creation but NOT
 *    released to the companion until the booking is completed
 * 2. COMPANION AUTONOMY — companions can decline without penalty
 * 3. VENUE SAFETY — meetings must happen at verified public venues
 * 4. TWO-WAY REVIEWS — both parties can review after completion
 * 5. DISPUTE RESOLUTION — admin can investigate disputed bookings
 *
 * HOW IT CONNECTS:
 * ----------------
 * - clientId and companionId reference User model
 * - companionProfileId references CompanionProfile
 * - categoryId references Category
 * - booking.service.js manages state transitions and validation
 * - payment.service.js handles escrow and release
 * - Chat is created when a booking is accepted
 * - Reviews are linked to completed bookings
 */

import mongoose from 'mongoose';
import {
  BOOKING_STATUS,
  BOOKING_STATUS_ARRAY,
  PAYMENT_STATUS,
  PAYMENT_STATUS_ARRAY,
  PLATFORM_CONFIG,
} from '../constants/index.js';

const { Schema } = mongoose;

/**
 * Venue sub-schema.
 * Every booking must specify a public meeting place.
 * This is a safety requirement — private locations are not allowed.
 */
const venueSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Venue name is required'],
      trim: true,
      maxlength: 200,
    },
    address: {
      type: String,
      required: [true, 'Venue address is required'],
      trim: true,
      maxlength: 500,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
      },
    },
  },
  { _id: false }
);

const bookingSchema = new Schema(
  {
    // ── Participants ──
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Client ID is required'],
    },

    companionId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Companion user ID is required'],
    },

    companionProfileId: {
      type: Schema.Types.ObjectId,
      ref: 'CompanionProfile',
      required: [true, 'Companion profile ID is required'],
    },

    // ── Activity ──
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },

    // ── Status (State Machine) ──
    status: {
      type: String,
      enum: {
        values: BOOKING_STATUS_ARRAY,
        message: 'Status must be one of: {VALUE}',
      },
      default: BOOKING_STATUS.REQUESTED,
    },

    // ── Scheduling ──
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled date is required'],
    },

    scheduledStartTime: {
      type: String,
      required: [true, 'Start time is required'],
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'Start time must be in HH:MM format'],
    },

    scheduledEndTime: {
      type: String,
      required: [true, 'End time is required'],
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'End time must be in HH:MM format'],
    },

    // Actual times (set when booking starts/ends)
    actualStartTime: {
      type: Date,
    },

    actualEndTime: {
      type: Date,
    },

    // ── Venue ──
    venue: {
      type: venueSchema,
      required: [true, 'Meeting venue is required'],
    },

    // ── Duration & Pricing ──
    duration: {
      type: Number, // Hours
      required: [true, 'Duration is required'],
      min: [1, 'Minimum booking duration is 1 hour'],
      max: [12, 'Maximum booking duration is 12 hours'],
    },

    hourlyRate: {
      type: Number,
      required: true,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    platformFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    companionEarnings: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ── Payment ──
    paymentStatus: {
      type: String,
      enum: {
        values: PAYMENT_STATUS_ARRAY,
        message: 'Payment status must be one of: {VALUE}',
      },
      default: PAYMENT_STATUS.PENDING,
    },

    razorpayOrderId: {
      type: String,
    },

    razorpayPaymentId: {
      type: String,
    },

    // ── Cancellation ──
    cancellationReason: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    cancelledAt: {
      type: Date,
    },

    // ── Dispute ──
    disputeReason: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    disputedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    disputedAt: {
      type: Date,
    },

    disputeResolvedAt: {
      type: Date,
    },

    // ── Notes ──
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    // ── Review Tracking ──
    isClientReviewed: {
      type: Boolean,
      default: false,
    },

    isCompanionReviewed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ──────────────────────────────────────────────
// Indexes
// ──────────────────────────────────────────────

// Find bookings by client (my bookings as a client)
bookingSchema.index({ clientId: 1, status: 1 });

// Find bookings by companion (my bookings as a companion)
bookingSchema.index({ companionId: 1, status: 1 });

// Date-based queries (upcoming bookings)
bookingSchema.index({ scheduledDate: 1, status: 1 });

// Payment processing queries
bookingSchema.index({ paymentStatus: 1 });

// ──────────────────────────────────────────────
// Pre-Save Hook: Calculate Fees
// ──────────────────────────────────────────────
/**
 * Before saving, calculate the platform fee and companion earnings
 * based on the total amount and platform fee percentage.
 *
 * totalAmount = hourlyRate × duration
 * platformFee = totalAmount × 20%
 * companionEarnings = totalAmount × 80%
 */
bookingSchema.pre('save', function (next) {
  if (this.isModified('totalAmount') || this.isNew) {
    const feePercent = PLATFORM_CONFIG.PLATFORM_FEE_PERCENT / 100;
    this.platformFee = Math.round(this.totalAmount * feePercent);
    this.companionEarnings = this.totalAmount - this.platformFee;
  }
  next();
});

// ──────────────────────────────────────────────
// Virtual: Booking Reference ID
// ──────────────────────────────────────────────
/**
 * Human-readable booking reference for customer support.
 * Format: CMP-<last 8 chars of ObjectId>
 * e.g. "CMP-a1b2c3d4"
 */
bookingSchema.virtual('referenceId').get(function () {
  return `CMP-${this._id.toString().slice(-8).toUpperCase()}`;
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
