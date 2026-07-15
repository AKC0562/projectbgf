/**
 * ==========================================================
 * FILE: src/controllers/auth.controller.js
 * ==========================================================
 *
 * WHY THIS FILE EXISTS:
 * ---------------------
 * Controllers are the THIN LAYER between HTTP and business logic.
 * Each controller method:
 * 1. Extracts data from the request (req.body, req.params, req.user)
 * 2. Calls the appropriate service method
 * 3. Sends the response using ApiResponse
 *
 * Controllers NEVER contain business logic. If you find yourself writing
 * if/else chains, database queries, or complex transformations in a
 * controller — it belongs in a service.
 *
 * HOW IT CONNECTS:
 * ----------------
 * - auth.routes.js maps endpoints to these controller methods
 * - Each method calls auth.service.js for business logic
 * - Responses use ApiResponse for consistency
 * - Errors are thrown (not caught) — asyncHandler catches them
 */

import authService from '../services/auth.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @route   POST /api/v1/auth/send-otp
 * @desc    Send OTP to phone number for login/registration
 * @access  Public
 */
export const sendOTP = asyncHandler(async (req, res) => {
  const { phone } = req.body;

  const result = await authService.sendOTP(phone);

  res.status(200).json(
    new ApiResponse(200, result, 'OTP sent successfully')
  );
});

/**
 * @route   POST /api/v1/auth/verify-otp
 * @desc    Verify OTP and login (or indicate new user needs registration)
 * @access  Public
 */
export const verifyOTP = asyncHandler(async (req, res) => {
  const { phone, otp, deviceId } = req.body;

  const result = await authService.verifyOTPAndLogin(phone, otp, deviceId);

  // If it's a new user, the client needs to show the registration form
  if (result.isNewUser) {
    return res.status(200).json(
      new ApiResponse(200, result, 'Phone verified — complete registration')
    );
  }

  // Existing user — set refresh token as HTTP-only cookie
  setRefreshTokenCookie(res, result.refreshToken);

  res.status(200).json(
    new ApiResponse(200, {
      user: result.user,
      accessToken: result.accessToken,
    }, 'Logged in successfully')
  );
});

/**
 * @route   POST /api/v1/auth/register
 * @desc    Complete registration after OTP verification
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const { phone, fullName, email, password, dob, gender, deviceId } = req.body;

  const result = await authService.register(
    { phone, fullName, email, password, dob, gender },
    deviceId
  );

  // Set refresh token as HTTP-only cookie
  setRefreshTokenCookie(res, result.refreshToken);

  res.status(201).json(
    new ApiResponse(201, {
      user: result.user,
      accessToken: result.accessToken,
    }, 'Registration successful')
  );
});

/**
 * @route   POST /api/v1/auth/google
 * @desc    Login or register with Google
 * @access  Public
 */
export const googleLogin = asyncHandler(async (req, res) => {
  const { googleId, email, fullName, avatar, deviceId } = req.body;

  const result = await authService.googleLogin(
    { googleId, email, fullName, avatar },
    deviceId
  );

  if (result.isNewUser) {
    return res.status(200).json(
      new ApiResponse(200, result, 'Google verified — complete registration')
    );
  }

  setRefreshTokenCookie(res, result.refreshToken);

  res.status(200).json(
    new ApiResponse(200, {
      user: result.user,
      accessToken: result.accessToken,
    }, 'Google login successful')
  );
});

/**
 * @route   POST /api/v1/auth/refresh-token
 * @desc    Refresh access token using refresh token
 * @access  Public (but requires valid refresh token)
 */
export const refreshToken = asyncHandler(async (req, res) => {
  // Try to get refresh token from cookie first, then from body
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  const { deviceId } = req.body;

  if (!token) {
    return res.status(401).json(
      new ApiResponse(401, null, 'Refresh token is required')
    );
  }

  const result = await authService.refreshAccessToken(token, deviceId);

  // Set the new refresh token as cookie
  setRefreshTokenCookie(res, result.refreshToken);

  res.status(200).json(
    new ApiResponse(200, {
      accessToken: result.accessToken,
    }, 'Token refreshed successfully')
  );
});

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout current device
 * @access  Private (requires valid access token)
 */
export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;

  if (token) {
    await authService.logout(req.user._id, token);
  }

  // Clear the refresh token cookie
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.status(200).json(
    new ApiResponse(200, null, 'Logged out successfully')
  );
});

/**
 * @route   POST /api/v1/auth/logout-all
 * @desc    Logout from all devices
 * @access  Private
 */
export const logoutAll = asyncHandler(async (req, res) => {
  await authService.logoutAll(req.user._id);

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.status(200).json(
    new ApiResponse(200, null, 'Logged out from all devices')
  );
});

// ──────────────────────────────────────────────
// Helper: Set Refresh Token Cookie
// ──────────────────────────────────────────────
/**
 * Sets the refresh token as an HTTP-only, secure cookie.
 *
 * HTTP-only: JavaScript CANNOT read this cookie (XSS protection)
 * Secure: Only sent over HTTPS in production
 * SameSite strict: Not sent with cross-site requests (CSRF protection)
 * MaxAge: 7 days (matches refresh token expiry)
 *
 * @param {import('express').Response} res
 * @param {string} refreshToken
 */
const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: '/',
  });
};
