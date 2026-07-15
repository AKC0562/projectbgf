/**
 * ==========================================================
 * FILE: src/services/report.service.js
 * ==========================================================
 */

import Report from '../models/Report.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { TRUST_SCORE } from '../constants/index.js';
import { buildPaginationQuery, buildPaginationResponse } from '../utils/helpers.js';

/**
 * Create a report against another user.
 *
 * @param {object} reportData - { reportedUserId, bookingId, reason, description, evidence }
 * @param {string} reporterId
 * @returns {Promise<Report>}
 */
const createReport = async (reportData, reporterId) => {
  const { reportedUserId, bookingId, reason, description, evidence } = reportData;

  // Can't report yourself
  if (reportedUserId === reporterId.toString()) {
    throw ApiError.badRequest('You cannot report yourself');
  }

  // Check reported user exists
  const reportedUser = await User.findById(reportedUserId);
  if (!reportedUser) {
    throw ApiError.notFound('Reported user not found');
  }

  const report = await Report.create({
    reporterId,
    reportedUserId,
    bookingId,
    reason,
    description,
    evidence: evidence || [],
  });

  // Apply immediate trust score penalty to the reported user
  await User.findByIdAndUpdate(reportedUserId, {
    $inc: { trustScore: TRUST_SCORE.REPORT_PENALTY },
  });

  return report;
};

/**
 * Get reports submitted by a user.
 *
 * @param {string} userId
 * @param {object} queryParams
 * @returns {Promise<{ reports, pagination }>}
 */
const getMyReports = async (userId, queryParams) => {
  const { page, limit, skip } = buildPaginationQuery(queryParams);

  const [reports, total] = await Promise.all([
    Report.find({ reporterId: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('reportedUserId', 'fullName avatar')
      .populate('bookingId', 'scheduledDate categoryId'),
    Report.countDocuments({ reporterId: userId }),
  ]);

  return {
    reports,
    pagination: buildPaginationResponse(total, page, limit),
  };
};

export default {
  createReport,
  getMyReports,
};
