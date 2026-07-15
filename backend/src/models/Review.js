/**
 * ==========================================================
 * FILE: src/models/Review.js
 * ==========================================================
 *
 * WHY THIS FILE EXISTS:
 * ---------------------
 * Two-way rating system — both client and companion review each other
 * after a completed booking. This builds trust and accountability.
 *
 * Design decisions:
 * 1. One review per booking per reviewer (enforced by compound unique index)
 * 2. Reviews are only allowed after booking completion
 * 3. Admin can hide inappropriate reviews (isVisible flag)
 * 4. Tags provide quick categorization (punctual, friendly, etc.)
 *
 * HOW IT CONNECTS:
 * ----------------
 * - Linked to Booking (reviewable only after completion)
 * - review.service.js updates CompanionProfile.averageRating and User.trustScore
 * - Booking tracks isClientReviewed / isCompanionReviewed
 */

import mongoose from 'mongoose';
import { REVIEW_TAGS, PLATFORM_CONFIG } from '../constants/index.js';

const { Schema } = mongoose;

const reviewSchema = new Schema(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking ID is required'],
    },

    reviewerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reviewer ID is required'],
    },

    revieweeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reviewee ID is required'],
    },

    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },

    comment: {
      type: String,
      trim: true,
      maxlength: [PLATFORM_CONFIG.REVIEW_MAX_LENGTH, `Review cannot exceed ${PLATFORM_CONFIG.REVIEW_MAX_LENGTH} characters`],
    },

    tags: {
      type: [String],
      enum: REVIEW_TAGS,
      default: [],
    },

    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: one review per booking per reviewer
reviewSchema.index({ bookingId: 1, reviewerId: 1 }, { unique: true });

// Query reviews for a specific user
reviewSchema.index({ revieweeId: 1, isVisible: 1 });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
