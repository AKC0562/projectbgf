/**
 * ==========================================================
 * FILE: src/services/admin.service.js
 * ==========================================================
 *
 * WHY THIS FILE EXISTS:
 * ---------------------
 * Admin business logic — dashboard stats, user management, KYC review,
 * booking oversight, report resolution, category management, and analytics.
 *
 * This is the most powerful service in the system. It can:
 * - Ban/unban users
 * - Approve/reject KYC documents
 * - Resolve disputes
 * - Manage categories
 * - View platform-wide analytics
 *
 * All admin routes are gated behind protect + authorize('admin').
 *
 * HOW IT CONNECTS:
 * ----------------
 * - admin.controller.js calls these methods
 * - Touches ALL models (User, CompanionProfile, Booking, Report, Review, Category)
 * - KYC approval updates User.kycStatus and trustScore
 * - Report resolution can lead to user bans
 */

import User from '../models/User.js';
import CompanionProfile from '../models/CompanionProfile.js';
import Booking from '../models/Booking.js';
import Report from '../models/Report.js';
import Review from '../models/Review.js';
import Category from '../models/Category.js';
import Message from '../models/Message.js';
import ApiError from '../utils/ApiError.js';
import { buildPaginationQuery, buildPaginationResponse } from '../utils/helpers.js';
import {
  KYC_STATUS,
  REPORT_STATUS,
  BOOKING_STATUS,
  TRUST_SCORE,
} from '../constants/index.js';

// ──────────────────────────────────────────────
// Dashboard
// ──────────────────────────────────────────────

/**
 * Get dashboard overview statistics.
 */
const getDashboardStats = async () => {
  const [
    totalUsers,
    totalCompanions,
    totalBookings,
    completedBookings,
    pendingKYC,
    pendingReports,
    activeBookings,
    totalRevenue,
  ] = await Promise.all([
    User.countDocuments({ isDeleted: false }),
    User.countDocuments({ role: 'companion', isDeleted: false }),
    Booking.countDocuments(),
    Booking.countDocuments({ status: BOOKING_STATUS.COMPLETED }),
    User.countDocuments({ kycStatus: KYC_STATUS.PENDING }),
    Report.countDocuments({ status: REPORT_STATUS.PENDING }),
    Booking.countDocuments({
      status: { $in: [BOOKING_STATUS.REQUESTED, BOOKING_STATUS.ACCEPTED, BOOKING_STATUS.ONGOING] },
    }),
    Booking.aggregate([
      { $match: { status: BOOKING_STATUS.COMPLETED } },
      { $group: { _id: null, total: { $sum: '$platformFee' } } },
    ]),
  ]);

  return {
    users: {
      total: totalUsers,
      companions: totalCompanions,
      clients: totalUsers - totalCompanions,
    },
    bookings: {
      total: totalBookings,
      completed: completedBookings,
      active: activeBookings,
    },
    pendingActions: {
      kycReviews: pendingKYC,
      reports: pendingReports,
    },
    revenue: {
      totalPlatformFee: totalRevenue[0]?.total || 0,
    },
  };
};

// ──────────────────────────────────────────────
// User Management
// ──────────────────────────────────────────────

/**
 * List all users with filters and pagination.
 */
const listUsers = async (queryParams) => {
  const { page, limit, skip } = buildPaginationQuery(queryParams);
  const { role, kycStatus, search, isBanned } = queryParams;

  const filter = {};
  if (role) filter.role = role;
  if (kycStatus) filter.kycStatus = kycStatus;
  if (isBanned !== undefined) filter.isBanned = isBanned === 'true';
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  // Include deleted users for admin view
  filter.isDeleted = { $in: [true, false] };

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v'),
    User.countDocuments(filter),
  ]);

  return {
    users,
    pagination: buildPaginationResponse(total, page, limit),
  };
};

/**
 * Ban a user.
 */
const banUser = async (userId, adminId, reason) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');
  if (user.role === 'admin') throw ApiError.forbidden('Cannot ban an admin');

  user.isBanned = true;
  user.banReason = reason;
  user.bannedAt = new Date();
  user.bannedBy = adminId;
  user.isOnline = false;
  await user.save();

  // Deactivate companion profile if exists
  await CompanionProfile.findOneAndUpdate(
    { userId },
    { isActive: false }
  );

  return user;
};

/**
 * Unban a user.
 */
const unbanUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');

  user.isBanned = false;
  user.banReason = undefined;
  user.bannedAt = undefined;
  user.bannedBy = undefined;
  await user.save();

  return user;
};

// ──────────────────────────────────────────────
// KYC Management
// ──────────────────────────────────────────────

/**
 * Get pending KYC applications.
 */
const getPendingKYC = async (queryParams) => {
  const { page, limit, skip } = buildPaginationQuery(queryParams);

  const filter = { kycStatus: KYC_STATUS.PENDING };

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: 1 }) // Oldest first (FIFO review)
      .skip(skip)
      .limit(limit)
      .select('fullName email phone kycDocuments kycStatus createdAt'),
    User.countDocuments(filter),
  ]);

  return {
    users,
    pagination: buildPaginationResponse(total, page, limit),
  };
};

/**
 * Approve KYC for a user.
 */
const approveKYC = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');

  if (user.kycStatus === KYC_STATUS.VERIFIED) {
    throw ApiError.badRequest('KYC is already verified');
  }

  user.kycStatus = KYC_STATUS.VERIFIED;
  user.kycRejectionReason = undefined;
  user.trustScore = Math.min(
    TRUST_SCORE.MAX,
    user.trustScore + TRUST_SCORE.KYC_VERIFIED_BONUS
  );
  await user.save();

  return user;
};

/**
 * Reject KYC with a reason.
 */
const rejectKYC = async (userId, reason) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');

  user.kycStatus = KYC_STATUS.REJECTED;
  user.kycRejectionReason = reason;
  await user.save();

  return user;
};

// ──────────────────────────────────────────────
// Booking Management
// ──────────────────────────────────────────────

/**
 * List all bookings with filters.
 */
const listBookings = async (queryParams) => {
  const { page, limit, skip } = buildPaginationQuery(queryParams);
  const { status } = queryParams;

  const filter = {};
  if (status) filter.status = status;

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('clientId', 'fullName avatar')
      .populate('companionId', 'fullName avatar')
      .populate('categoryId', 'name slug'),
    Booking.countDocuments(filter),
  ]);

  return {
    bookings,
    pagination: buildPaginationResponse(total, page, limit),
  };
};

/**
 * Resolve a disputed booking.
 */
const resolveDispute = async (bookingId, resolution, adminNotes) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw ApiError.notFound('Booking not found');
  if (booking.status !== BOOKING_STATUS.DISPUTED) {
    throw ApiError.badRequest('Booking is not in disputed status');
  }

  booking.status = resolution; // 'completed' or 'cancelled'
  booking.disputeResolvedAt = new Date();
  await booking.save();

  return booking;
};

// ──────────────────────────────────────────────
// Report Management
// ──────────────────────────────────────────────

/**
 * List reports with filters.
 */
const listReports = async (queryParams) => {
  const { page, limit, skip } = buildPaginationQuery(queryParams);
  const { status } = queryParams;

  const filter = {};
  if (status) filter.status = status;

  const [reports, total] = await Promise.all([
    Report.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('reporterId', 'fullName avatar')
      .populate('reportedUserId', 'fullName avatar trustScore isBanned')
      .populate('bookingId', 'scheduledDate status'),
    Report.countDocuments(filter),
  ]);

  return {
    reports,
    pagination: buildPaginationResponse(total, page, limit),
  };
};

/**
 * Resolve a report.
 */
const resolveReport = async (reportId, adminId, status, adminNotes) => {
  const report = await Report.findById(reportId);
  if (!report) throw ApiError.notFound('Report not found');

  report.status = status;
  report.adminNotes = adminNotes;
  report.resolvedBy = adminId;
  report.resolvedAt = new Date();
  await report.save();

  return report;
};

// ──────────────────────────────────────────────
// Category Management
// ──────────────────────────────────────────────

/**
 * Create a new category.
 */
const createCategory = async (categoryData) => {
  const category = await Category.create(categoryData);
  return category;
};

/**
 * Update a category.
 */
const updateCategory = async (categoryId, updateData) => {
  const category = await Category.findByIdAndUpdate(
    categoryId,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (!category) throw ApiError.notFound('Category not found');
  return category;
};

/**
 * Delete (deactivate) a category.
 */
const deleteCategory = async (categoryId) => {
  const category = await Category.findByIdAndUpdate(
    categoryId,
    { isActive: false },
    { new: true }
  );

  if (!category) throw ApiError.notFound('Category not found');
  return category;
};

// ──────────────────────────────────────────────
// Analytics
// ──────────────────────────────────────────────

/**
 * Get bookings analytics by time period.
 */
const getBookingAnalytics = async (period = 'month') => {
  const now = new Date();
  let startDate;

  switch (period) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const [bookingsByStatus, bookingsByCategory, revenueByDay] = await Promise.all([
    // Bookings grouped by status
    Booking.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),

    // Bookings grouped by category
    Booking.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$categoryId', count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      { $project: { name: '$category.name', count: 1, revenue: 1 } },
      { $sort: { count: -1 } },
    ]),

    // Revenue by day
    Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: BOOKING_STATUS.COMPLETED,
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          totalRevenue: { $sum: '$totalAmount' },
          platformFee: { $sum: '$platformFee' },
          bookingCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  return {
    period,
    startDate,
    bookingsByStatus,
    bookingsByCategory,
    revenueByDay,
  };
};

/**
 * Get flagged messages for moderation review.
 */
const getFlaggedMessages = async (queryParams) => {
  const { page, limit, skip } = buildPaginationQuery(queryParams);

  const [messages, total] = await Promise.all([
    Message.find({ isFlagged: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('senderId', 'fullName avatar')
      .populate('chatId'),
    Message.countDocuments({ isFlagged: true }),
  ]);

  return {
    messages,
    pagination: buildPaginationResponse(total, page, limit),
  };
};

export default {
  getDashboardStats,
  listUsers,
  banUser,
  unbanUser,
  getPendingKYC,
  approveKYC,
  rejectKYC,
  listBookings,
  resolveDispute,
  listReports,
  resolveReport,
  createCategory,
  updateCategory,
  deleteCategory,
  getBookingAnalytics,
  getFlaggedMessages,
};
