/**
 * ==========================================================
 * FILE: src/routes/admin.routes.js
 * ==========================================================
 *
 * WHY THIS FILE EXISTS:
 * ---------------------
 * All admin API endpoints. Every route here is protected by:
 * 1. protect — JWT authentication
 * 2. authorize('admin') — only admin role can access
 *
 * HOW IT CONNECTS:
 * ----------------
 * - Mounted in app.js as: app.use('/api/v1/admin', adminRoutes)
 * - All requests must have a valid JWT from an admin user
 */

import { Router } from 'express';
import {
  getDashboard,
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
  getAnalytics,
  getFlaggedMessages,
} from '../controllers/admin.controller.js';

import {
  listUsersValidator,
  banUserValidator,
  userIdParamValidator,
  kycActionValidator,
  rejectKYCValidator,
  listBookingsValidator,
  resolveDisputeValidator,
  listReportsValidator,
  resolveReportValidator,
  createCategoryValidator,
  updateCategoryValidator,
  analyticsValidator,
} from '../validators/admin.validator.js';

import validate from '../middleware/validate.js';
import protect from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';

const router = Router();

// All admin routes require authentication + admin role
router.use(protect);
router.use(authorize('admin'));

// ── Dashboard ──
router.get('/dashboard', getDashboard);

// ── User Management ──
router.get('/users', listUsersValidator, validate, listUsers);
router.patch('/users/:userId/ban', banUserValidator, validate, banUser);
router.patch('/users/:userId/unban', userIdParamValidator, validate, unbanUser);

// ── KYC ──
router.get('/kyc/pending', getPendingKYC);
router.patch('/kyc/:userId/approve', kycActionValidator, validate, approveKYC);
router.patch('/kyc/:userId/reject', rejectKYCValidator, validate, rejectKYC);

// ── Bookings ──
router.get('/bookings', listBookingsValidator, validate, listBookings);
router.patch('/bookings/:bookingId/resolve', resolveDisputeValidator, validate, resolveDispute);

// ── Reports ──
router.get('/reports', listReportsValidator, validate, listReports);
router.patch('/reports/:reportId/resolve', resolveReportValidator, validate, resolveReport);

// ── Categories ──
router.post('/categories', createCategoryValidator, validate, createCategory);
router.put('/categories/:categoryId', updateCategoryValidator, validate, updateCategory);
router.delete('/categories/:categoryId', deleteCategory);

// ── Analytics ──
router.get('/analytics', analyticsValidator, validate, getAnalytics);

// ── Moderation ──
router.get('/moderation/messages', getFlaggedMessages);

export default router;
