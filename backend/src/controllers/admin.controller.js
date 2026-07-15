/**
 * ==========================================================
 * FILE: src/controllers/admin.controller.js
 * ==========================================================
 *
 * WHY THIS FILE EXISTS:
 * ---------------------
 * Admin panel API controllers. All endpoints here are protected by
 * protect + authorize('admin') middleware in the route file.
 *
 * HOW IT CONNECTS:
 * ----------------
 * - admin.routes.js maps endpoints here
 * - Delegates to admin.service.js for business logic
 */

import adminService from '../services/admin.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// ── Dashboard ──
export const getDashboard = asyncHandler(async (req, res) => {
  const stats = await adminService.getDashboardStats();
  res.status(200).json(new ApiResponse(200, stats, 'Dashboard stats fetched'));
});

// ── Users ──
export const listUsers = asyncHandler(async (req, res) => {
  const { users, pagination } = await adminService.listUsers(req.query);
  res.status(200).json(ApiResponse.paginated(users, pagination, 'Users fetched'));
});

export const banUser = asyncHandler(async (req, res) => {
  const user = await adminService.banUser(req.params.userId, req.user._id, req.body.reason);
  res.status(200).json(new ApiResponse(200, { userId: user._id, isBanned: true }, 'User banned'));
});

export const unbanUser = asyncHandler(async (req, res) => {
  const user = await adminService.unbanUser(req.params.userId);
  res.status(200).json(new ApiResponse(200, { userId: user._id, isBanned: false }, 'User unbanned'));
});

// ── KYC ──
export const getPendingKYC = asyncHandler(async (req, res) => {
  const { users, pagination } = await adminService.getPendingKYC(req.query);
  res.status(200).json(ApiResponse.paginated(users, pagination, 'Pending KYC applications'));
});

export const approveKYC = asyncHandler(async (req, res) => {
  const user = await adminService.approveKYC(req.params.userId);
  res.status(200).json(new ApiResponse(200, { userId: user._id, kycStatus: user.kycStatus }, 'KYC approved'));
});

export const rejectKYC = asyncHandler(async (req, res) => {
  const user = await adminService.rejectKYC(req.params.userId, req.body.reason);
  res.status(200).json(new ApiResponse(200, { userId: user._id, kycStatus: user.kycStatus }, 'KYC rejected'));
});

// ── Bookings ──
export const listBookings = asyncHandler(async (req, res) => {
  const { bookings, pagination } = await adminService.listBookings(req.query);
  res.status(200).json(ApiResponse.paginated(bookings, pagination, 'Bookings fetched'));
});

export const resolveDispute = asyncHandler(async (req, res) => {
  const booking = await adminService.resolveDispute(
    req.params.bookingId,
    req.body.resolution,
    req.body.adminNotes
  );
  res.status(200).json(new ApiResponse(200, booking, 'Dispute resolved'));
});

// ── Reports ──
export const listReports = asyncHandler(async (req, res) => {
  const { reports, pagination } = await adminService.listReports(req.query);
  res.status(200).json(ApiResponse.paginated(reports, pagination, 'Reports fetched'));
});

export const resolveReport = asyncHandler(async (req, res) => {
  const report = await adminService.resolveReport(
    req.params.reportId,
    req.user._id,
    req.body.status,
    req.body.adminNotes
  );
  res.status(200).json(new ApiResponse(200, report, 'Report resolved'));
});

// ── Categories ──
export const createCategory = asyncHandler(async (req, res) => {
  const category = await adminService.createCategory(req.body);
  res.status(201).json(new ApiResponse(201, category, 'Category created'));
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await adminService.updateCategory(req.params.categoryId, req.body);
  res.status(200).json(new ApiResponse(200, category, 'Category updated'));
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await adminService.deleteCategory(req.params.categoryId);
  res.status(200).json(new ApiResponse(200, category, 'Category deactivated'));
});

// ── Analytics ──
export const getAnalytics = asyncHandler(async (req, res) => {
  const analytics = await adminService.getBookingAnalytics(req.query.period);
  res.status(200).json(new ApiResponse(200, analytics, 'Analytics fetched'));
});

// ── Moderation ──
export const getFlaggedMessages = asyncHandler(async (req, res) => {
  const { messages, pagination } = await adminService.getFlaggedMessages(req.query);
  res.status(200).json(ApiResponse.paginated(messages, pagination, 'Flagged messages fetched'));
});
