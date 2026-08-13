/**
 * ==========================================================
 * FILE: src/controllers/companion.controller.js
 * ==========================================================
 *
 * WHY THIS FILE EXISTS:
 * ---------------------
 * Handles companion profile management and companion discovery.
 * Two distinct user groups interact with this controller:
 *
 * 1. COMPANIONS managing their own profiles:
 *    - Create profile, update details, toggle availability
 * 2. CLIENTS discovering companions:
 *    - Search with filters (location, category, price, rating)
 *    - View companion profile details
 *
 * HOW IT CONNECTS:
 * ----------------
 * - companion.routes.js maps endpoints to these methods
 * - CompanionProfile model stores companion-specific data
 * - Category model is populated in search results
 * - User model is referenced for owner identity
 */

import mongoose from 'mongoose';
import CompanionProfile from '../models/CompanionProfile.js';
import Category from '../models/Category.js';
import User from '../models/User.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { buildPaginationQuery, buildPaginationResponse } from '../utils/helpers.js';
import { USER_ROLES } from '../constants/index.js';

/**
 * @route   POST /api/v1/companions/profile
 * @desc    Create a companion profile (apply to become a companion)
 * @access  Private (authenticated users)
 */
export const createCompanionProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Check if companion profile already exists
  const existing = await CompanionProfile.findOne({ userId });
  if (existing) {
    throw ApiError.conflict('You already have a companion profile');
  }

  // Validate that all category IDs exist
  if (req.body.categories && req.body.categories.length > 0) {
    const validCategories = await Category.countDocuments({
      _id: { $in: req.body.categories },
      isActive: true,
    });
    if (validCategories !== req.body.categories.length) {
      throw ApiError.badRequest('One or more category IDs are invalid or inactive');
    }
  }

  // Create the companion profile
  const profile = await CompanionProfile.create({
    userId,
    displayName: req.body.displayName || req.user.fullName,
    tagline: req.body.tagline,
    hourlyRate: req.body.hourlyRate,
    categories: req.body.categories,
    languages: req.body.languages || [],
    interests: req.body.interests || [],
    experience: req.body.experience,
    availability: req.body.availability || [],
    // Copy user's location as initial service location
    serviceLocation: req.user.location || undefined,
  });

  // Update user role to 'companion'
  await User.findByIdAndUpdate(userId, {
    $set: { role: USER_ROLES.COMPANION },
  });

  // Update companion count for selected categories
  await Category.updateMany(
    { _id: { $in: req.body.categories } },
    { $inc: { companionCount: 1 } }
  );

  // Populate categories for the response
  await profile.populate('categories', 'name slug icon');

  res.status(201).json(
    new ApiResponse(201, profile, 'Companion profile created successfully')
  );
});

/**
 * @route   GET /api/v1/companions/profile/me
 * @desc    Get my companion profile
 * @access  Private (companions only)
 */
export const getMyCompanionProfile = asyncHandler(async (req, res) => {
  const profile = await CompanionProfile.findOne({ userId: req.user._id })
    .populate('categories', 'name slug icon')
    .populate('userId', 'fullName avatar phone email trustScore kycStatus');

  if (!profile) {
    throw ApiError.notFound('Companion profile not found — create one first');
  }

  res.status(200).json(
    new ApiResponse(200, profile, 'Companion profile fetched')
  );
});

/**
 * @route   PUT /api/v1/companions/profile/me
 * @desc    Update my companion profile
 * @access  Private (companions only)
 */
export const updateCompanionProfile = asyncHandler(async (req, res) => {
  const profile = await CompanionProfile.findOne({ userId: req.user._id });

  if (!profile) {
    throw ApiError.notFound('Companion profile not found');
  }

  // Track old categories for count updates
  const oldCategories = profile.categories.map((c) => c.toString());

  // Allowed update fields
  const allowedFields = [
    'displayName', 'tagline', 'hourlyRate', 'categories',
    'languages', 'interests', 'experience', 'availability',
    'isActive', 'serviceRadius',
  ];

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      profile[field] = req.body[field];
    }
  }

  // Validate new categories if provided
  if (req.body.categories) {
    const validCategories = await Category.countDocuments({
      _id: { $in: req.body.categories },
      isActive: true,
    });
    if (validCategories !== req.body.categories.length) {
      throw ApiError.badRequest('One or more category IDs are invalid or inactive');
    }

    // Update category companion counts
    const newCategories = req.body.categories.map((c) => c.toString());
    const removed = oldCategories.filter((c) => !newCategories.includes(c));
    const added = newCategories.filter((c) => !oldCategories.includes(c));

    if (removed.length > 0) {
      await Category.updateMany(
        { _id: { $in: removed } },
        { $inc: { companionCount: -1 } }
      );
    }
    if (added.length > 0) {
      await Category.updateMany(
        { _id: { $in: added } },
        { $inc: { companionCount: 1 } }
      );
    }
  }

  await profile.save();
  await profile.populate('categories', 'name slug icon');

  res.status(200).json(
    new ApiResponse(200, profile, 'Companion profile updated')
  );
});

/**
 * @route   GET /api/v1/companions/search
 * @desc    Search and discover companions with filters
 * @access  Private
 *
 * Supports:
 * - Category filter
 * - Price range filter
 * - Geo-proximity filter (latitude, longitude, radius in km)
 * - Minimum rating filter
 * - Language filter
 * - Sorting (rating, price, distance, bookings)
 * - Pagination
 */
export const searchCompanions = asyncHandler(async (req, res) => {
  const {
    category,
    minRate,
    maxRate,
    latitude,
    longitude,
    radius,
    minRating,
    language,
    sortBy,
  } = req.query;

  const { page, limit, skip } = buildPaginationQuery(req.query);

  // ── Build Query ──
  const filter = {
    isActive: true,
    isVerified: true,
  };

  // Category filter
  if (category) {
    const categoryQuery = [{ slug: category }];
    if (mongoose.isValidObjectId(category)) {
      categoryQuery.push({ _id: category });
    }

    const categoryRecord = await Category.findOne({
      $or: categoryQuery,
      isActive: true,
    }).select('_id');

    if (!categoryRecord) {
      return res.status(200).json(
        ApiResponse.paginated([], buildPaginationResponse(0, page, limit), 'Companions fetched')
      );
    }

    filter.categories = categoryRecord._id;
  }

  // Price range filter
  if (minRate || maxRate) {
    filter.hourlyRate = {};
    if (minRate) filter.hourlyRate.$gte = parseFloat(minRate);
    if (maxRate) filter.hourlyRate.$lte = parseFloat(maxRate);
  }

  // Minimum rating filter
  if (minRating) {
    filter.averageRating = { $gte: parseFloat(minRating) };
  }

  // Language filter
  if (language) {
    filter.languages = { $in: [language] };
  }

  // ── Build Sort ──
  let sort = {};
  switch (sortBy) {
    case 'rating':
      sort = { averageRating: -1 };
      break;
    case 'price_low':
      sort = { hourlyRate: 1 };
      break;
    case 'price_high':
      sort = { hourlyRate: -1 };
      break;
    case 'bookings':
      sort = { totalCompletedBookings: -1 };
      break;
    default:
      sort = { averageRating: -1, totalCompletedBookings: -1 };
  }

  // ── Geo Query (if location provided) ──
  let query;
  if (latitude && longitude) {
    const maxDistance = (parseFloat(radius) || 25) * 1000; // Convert km to meters

    filter.serviceLocation = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)],
        },
        $maxDistance: maxDistance,
      },
    };

    // $near already sorts by distance, so only add custom sort if not distance
    if (sortBy && sortBy !== 'distance') {
      query = CompanionProfile.find(filter).sort(sort);
    } else {
      query = CompanionProfile.find(filter);
    }
  } else {
    query = CompanionProfile.find(filter).sort(sort);
  }

  // ── Execute Query ──
  const [companions, total] = await Promise.all([
    query
      .skip(skip)
      .limit(limit)
      .populate('categories', 'name slug icon')
      .populate('userId', 'fullName avatar city state trustScore isOnline'),
    CompanionProfile.countDocuments(filter),
  ]);

  const pagination = buildPaginationResponse(total, page, limit);

  res.status(200).json(
    ApiResponse.paginated(companions, pagination, 'Companions fetched')
  );
});

/**
 * @route   GET /api/v1/companions/:companionId
 * @desc    Get a companion's public profile details
 * @access  Private
 */
export const getCompanionProfile = asyncHandler(async (req, res) => {
  const profile = await CompanionProfile.findById(req.params.companionId)
    .populate('categories', 'name slug icon description')
    .populate('userId', 'fullName avatar bio city state trustScore isOnline lastSeen profilePhotos age gender');

  if (!profile) {
    throw ApiError.notFound('Companion profile not found');
  }

  // Only show active, non-deleted profiles to non-admins
  if (!profile.isActive) {
    throw ApiError.notFound('Companion profile not found');
  }

  res.status(200).json(
    new ApiResponse(200, profile, 'Companion profile fetched')
  );
});

/**
 * @route   GET /api/v1/companions/categories
 * @desc    Get all active categories
 * @access  Public
 */
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true })
    .sort({ sortOrder: 1 })
    .select('name slug description icon companionCount');

  res.status(200).json(
    new ApiResponse(200, categories, 'Categories fetched')
  );
});
