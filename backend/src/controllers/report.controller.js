/**
 * ==========================================================
 * FILE: src/controllers/report.controller.js
 * ==========================================================
 */

import reportService from '../services/report.service.js';
import sosService from '../services/sos.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @route   POST /api/v1/reports
 * @desc    Submit a report against another user
 * @access  Private
 */
export const createReport = asyncHandler(async (req, res) => {
  const report = await reportService.createReport(req.body, req.user._id);

  res.status(201).json(
    new ApiResponse(201, report, 'Report submitted — our team will review it')
  );
});

/**
 * @route   GET /api/v1/reports/my
 * @desc    Get my submitted reports
 * @access  Private
 */
export const getMyReports = asyncHandler(async (req, res) => {
  const { reports, pagination } = await reportService.getMyReports(
    req.user._id,
    req.query
  );

  res.status(200).json(
    ApiResponse.paginated(reports, pagination, 'Reports fetched')
  );
});

/**
 * @route   POST /api/v1/reports/sos
 * @desc    Trigger an SOS emergency alert
 * @access  Private
 */
export const triggerSOS = asyncHandler(async (req, res) => {
  const { latitude, longitude, bookingId } = req.body;

  const result = await sosService.triggerSOS(
    req.user._id,
    latitude && longitude ? { latitude, longitude } : null,
    bookingId
  );

  res.status(200).json(
    new ApiResponse(200, result, result.message)
  );
});
