/**
 * ==========================================================
 * FILE: src/controllers/review.controller.js
 * ==========================================================
 */

import reviewService from '../services/review.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @route   POST /api/v1/reviews
 * @desc    Submit a review for a completed booking
 * @access  Private
 */
export const createReview = asyncHandler(async (req, res) => {
  const review = await reviewService.createReview(req.body, req.user._id);

  res.status(201).json(
    new ApiResponse(201, review, 'Review submitted successfully')
  );
});

/**
 * @route   GET /api/v1/reviews/user/:userId
 * @desc    Get reviews for a specific user
 * @access  Private
 */
export const getReviewsForUser = asyncHandler(async (req, res) => {
  const { reviews, pagination } = await reviewService.getReviewsForUser(
    req.params.userId,
    req.query
  );

  res.status(200).json(
    ApiResponse.paginated(reviews, pagination, 'Reviews fetched')
  );
});

/**
 * @route   GET /api/v1/reviews/user/:userId/stats
 * @desc    Get review statistics for a user
 * @access  Private
 */
export const getReviewStats = asyncHandler(async (req, res) => {
  const stats = await reviewService.getReviewStats(req.params.userId);

  res.status(200).json(
    new ApiResponse(200, stats, 'Review statistics fetched')
  );
});
