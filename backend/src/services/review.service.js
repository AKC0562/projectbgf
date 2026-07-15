/**
 * ==========================================================
 * FILE: src/services/review.service.js
 * ==========================================================
 *
 * WHY THIS FILE EXISTS:
 * ---------------------
 * Review business logic. Enforces:
 * 1. Only completed bookings can be reviewed
 * 2. One review per booking per reviewer
 * 3. Updates companion ratings and trust scores
 *
 * HOW IT CONNECTS:
 * ----------------
 * - review.controller.js calls these methods
 * - Booking model tracks review status
 * - CompanionProfile.updateRating() recalculates averages
 * - User.trustScore is adjusted for positive reviews
 */

import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import CompanionProfile from '../models/CompanionProfile.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { BOOKING_STATUS, TRUST_SCORE } from '../constants/index.js';
import { buildPaginationQuery, buildPaginationResponse } from '../utils/helpers.js';

/**
 * Create a review for a completed booking.
 *
 * @param {object} reviewData - { bookingId, rating, comment, tags }
 * @param {string} reviewerId - The reviewer's userId
 * @returns {Promise<Review>}
 */
const createReview = async (reviewData, reviewerId) => {
  const { bookingId, rating, comment, tags } = reviewData;

  // Step 1: Find the booking
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  // Step 2: Booking must be completed
  if (booking.status !== BOOKING_STATUS.COMPLETED) {
    throw ApiError.badRequest('Reviews can only be submitted for completed bookings');
  }

  // Step 3: Reviewer must be a participant
  const isClient = booking.clientId.toString() === reviewerId.toString();
  const isCompanion = booking.companionId.toString() === reviewerId.toString();

  if (!isClient && !isCompanion) {
    throw ApiError.forbidden('You are not a participant in this booking');
  }

  // Step 4: Determine reviewee
  const revieweeId = isClient
    ? booking.companionId
    : booking.clientId;

  // Step 5: Check for duplicate review
  const existingReview = await Review.findOne({ bookingId, reviewerId });
  if (existingReview) {
    throw ApiError.conflict('You have already reviewed this booking');
  }

  // Step 6: Create the review
  const review = await Review.create({
    bookingId,
    reviewerId,
    revieweeId,
    rating,
    comment,
    tags: tags || [],
  });

  // Step 7: Update booking review flags
  if (isClient) {
    booking.isClientReviewed = true;
  } else {
    booking.isCompanionReviewed = true;
  }
  await booking.save();

  // Step 8: Update companion profile rating (if the companion was reviewed)
  if (isClient) {
    // Client reviewed the companion
    const companionProfile = await CompanionProfile.findOne({
      userId: revieweeId,
    });
    if (companionProfile) {
      companionProfile.updateRating(rating);
      await companionProfile.save();
    }
  }

  // Step 9: Update trust score for positive reviews
  if (rating >= 4) {
    await User.findByIdAndUpdate(revieweeId, {
      $inc: { trustScore: TRUST_SCORE.POSITIVE_REVIEW_BONUS },
    });
  }

  return review;
};

/**
 * Get reviews for a user.
 *
 * @param {string} userId - The reviewee's ID
 * @param {object} queryParams - { page, limit }
 * @returns {Promise<{ reviews, pagination }>}
 */
const getReviewsForUser = async (userId, queryParams) => {
  const { page, limit, skip } = buildPaginationQuery(queryParams);

  const filter = { revieweeId: userId, isVisible: true };

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('reviewerId', 'fullName avatar')
      .populate('bookingId', 'categoryId scheduledDate'),
    Review.countDocuments(filter),
  ]);

  return {
    reviews,
    pagination: buildPaginationResponse(total, page, limit),
  };
};

/**
 * Get review stats for a user (average, count, distribution).
 *
 * @param {string} userId
 * @returns {Promise<object>}
 */
const getReviewStats = async (userId) => {
  const stats = await Review.aggregate([
    { $match: { revieweeId: userId, isVisible: true } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
        rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
        rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
        rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
        rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
      },
    },
  ]);

  if (stats.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };
  }

  const s = stats[0];
  return {
    averageRating: Math.round(s.averageRating * 10) / 10,
    totalReviews: s.totalReviews,
    distribution: {
      5: s.rating5,
      4: s.rating4,
      3: s.rating3,
      2: s.rating2,
      1: s.rating1,
    },
  };
};

export default {
  createReview,
  getReviewsForUser,
  getReviewStats,
};
