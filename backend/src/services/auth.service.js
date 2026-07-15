/**
 * ==========================================================
 * FILE: src/services/auth.service.js
 * ==========================================================
 *
 * WHY THIS FILE EXISTS:
 * ---------------------
 * This is the business logic layer for authentication. Controllers are
 * thin — they parse the request, call the service, and send the response.
 * Services contain all the actual logic.
 *
 * Why separate controllers from services?
 * 1. TESTABILITY — services can be unit tested without Express req/res
 * 2. REUSABILITY — the same service can be called from controllers,
 *    Socket.io handlers, background jobs, or admin scripts
 * 3. CLEAN ARCHITECTURE — controllers handle HTTP, services handle logic
 *
 * Auth flows:
 * 1. Phone + OTP: sendOTP → verifyOTPAndLogin (creates user if new)
 * 2. Google OAuth: verifyGoogleToken → find/create user → issue tokens
 * 3. Token refresh: validate refresh token → rotate → issue new pair
 * 4. Logout: invalidate refresh token for specific device
 *
 * HOW IT CONNECTS:
 * ----------------
 * - auth.controller.js calls these methods
 * - otp.service.js handles OTP generation/verification
 * - User model handles password hashing and token storage
 * - helpers.js generates JWT token pairs
 */

import User from '../models/User.js';
import otpService from './otp.service.js';
import ApiError from '../utils/ApiError.js';
import { generateTokenPair, sanitizeUser } from '../utils/helpers.js';
import jwt from 'jsonwebtoken';

/**
 * Step 1 of phone auth: Send OTP to the phone number.
 *
 * This doesn't create a user yet — the user is created (if new) only
 * after OTP verification. This prevents fake accounts from being created
 * by bots that just trigger OTP sends.
 *
 * @param {string} phone - Indian phone number (10 digits)
 * @returns {Promise<{ message: string, expiresInSeconds: number }>}
 */
const sendOTP = async (phone) => {
  return otpService.sendOTP(phone);
};

/**
 * Step 2 of phone auth: Verify OTP and log in (or register).
 *
 * Flow:
 * 1. Verify the OTP is correct
 * 2. Look up the user by phone number
 * 3. If user exists → login (issue tokens)
 * 4. If user doesn't exist → this is a new registration
 *    - We DON'T create the full user here; the client must call the
 *      registration endpoint with profile details after OTP verification
 *    - We return { isNewUser: true } to tell the client to show the
 *      registration form
 *
 * WAIT — why not create the user immediately?
 * Because the user needs to provide fullName, email, dob, gender, password
 * before we can create a valid User document. OTP just verifies phone ownership.
 *
 * @param {string} phone - Phone number
 * @param {string} otp - 6-digit OTP
 * @param {string} deviceId - Client device identifier for multi-device support
 * @returns {Promise<{ user, accessToken, refreshToken, isNewUser }>}
 */
const verifyOTPAndLogin = async (phone, otp, deviceId = 'unknown') => {
  // Step 1: Verify OTP (throws if invalid)
  otpService.verifyOTP(phone, otp);

  // Step 2: Find existing user
  const user = await User.findOne({ phone }).select('+refreshTokens');

  if (!user) {
    // New user — phone verified but account doesn't exist yet.
    // Client should redirect to the registration form.
    return {
      isNewUser: true,
      phone,
      message: 'Phone verified — please complete registration',
    };
  }

  // Step 3: Existing user — issue tokens
  user.isPhoneVerified = true;
  user.isOnline = true;
  user.lastSeen = new Date();

  // Generate JWT token pair
  const { accessToken, refreshToken } = generateTokenPair(
    user._id.toString(),
    user.role
  );

  // Store refresh token for this device
  // Limit to 5 devices — remove the oldest if exceeded
  if (!user.refreshTokens) user.refreshTokens = [];
  if (user.refreshTokens.length >= 5) {
    user.refreshTokens.shift(); // Remove oldest
  }
  user.refreshTokens.push({
    token: refreshToken,
    deviceId,
    createdAt: new Date(),
  });

  await user.save();

  return {
    isNewUser: false,
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
};

/**
 * Register a new user after phone verification.
 *
 * Called after verifyOTPAndLogin returns { isNewUser: true }.
 * The client submits phone + profile details to complete registration.
 *
 * @param {object} userData - { phone, fullName, email, password, dob, gender }
 * @param {string} deviceId - Client device identifier
 * @returns {Promise<{ user, accessToken, refreshToken }>}
 */
const register = async (userData, deviceId = 'unknown') => {
  const { phone, fullName, email, password, dob, gender } = userData;

  // Check if user already exists (double-safety)
  const existingUser = await User.findOne({
    $or: [{ phone }, { email }],
  });

  if (existingUser) {
    if (existingUser.phone === phone) {
      throw ApiError.conflict('Phone number is already registered');
    }
    throw ApiError.conflict('Email is already registered');
  }

  // Create the user
  const user = await User.create({
    fullName,
    email,
    phone,
    password,
    dob: new Date(dob),
    gender,
    isPhoneVerified: true, // Phone was verified via OTP
    authProvider: 'phone',
  });

  // Generate tokens
  const { accessToken, refreshToken } = generateTokenPair(
    user._id.toString(),
    user.role
  );

  // Store refresh token
  // We need to use findById + save to trigger the pre-save hook
  // and to update the select: false field
  const userWithTokens = await User.findById(user._id).select('+refreshTokens');
  userWithTokens.refreshTokens = [
    {
      token: refreshToken,
      deviceId,
      createdAt: new Date(),
    },
  ];
  await userWithTokens.save();

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
};

/**
 * Google OAuth login/registration.
 *
 * Flow:
 * 1. Verify the Google ID token (in production, use google-auth-library)
 * 2. Extract email and profile from the token payload
 * 3. Find user by googleId or email
 * 4. If exists → login
 * 5. If new → create user (Google provides name and email, but we still
 *    need phone, dob, etc. — return isNewUser for profile completion)
 *
 * @param {object} googleData - { googleId, email, fullName, avatar }
 * @param {string} deviceId - Client device identifier
 * @returns {Promise<{ user, accessToken, refreshToken, isNewUser }>}
 */
const googleLogin = async (googleData, deviceId = 'unknown') => {
  const { googleId, email, fullName, avatar } = googleData;

  // Look for existing user by googleId or email
  let user = await User.findOne({
    $or: [{ googleId }, { email }],
  }).select('+refreshTokens');

  if (user) {
    // Existing user — update Google ID if not set (email-matched user)
    if (!user.googleId) {
      user.googleId = googleId;
    }

    user.isOnline = true;
    user.lastSeen = new Date();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokenPair(
      user._id.toString(),
      user.role
    );

    if (!user.refreshTokens) user.refreshTokens = [];
    if (user.refreshTokens.length >= 5) {
      user.refreshTokens.shift();
    }
    user.refreshTokens.push({
      token: refreshToken,
      deviceId,
      createdAt: new Date(),
    });

    await user.save();

    return {
      isNewUser: false,
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  // New Google user — we need more info (phone, dob) to complete registration
  return {
    isNewUser: true,
    googleId,
    email,
    fullName,
    avatar,
    message: 'Google verified — please complete registration with phone and date of birth',
  };
};

/**
 * Refresh the access token using a valid refresh token.
 *
 * Token Rotation: When a refresh token is used, we issue a new pair
 * AND invalidate the old refresh token. This limits the damage if a
 * refresh token is stolen — the attacker can only use it once.
 *
 * @param {string} refreshToken - The current refresh token
 * @param {string} deviceId - Client device identifier
 * @returns {Promise<{ accessToken: string, refreshToken: string }>}
 */
const refreshAccessToken = async (refreshToken, deviceId = 'unknown') => {
  // Step 1: Verify the refresh token JWT
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw ApiError.unauthorized('Invalid or expired refresh token — please log in again');
  }

  // Step 2: Find user and check if this refresh token exists in their stored tokens
  const user = await User.findById(decoded.userId).select('+refreshTokens');

  if (!user) {
    throw ApiError.unauthorized('User not found');
  }

  // Step 3: Find the matching refresh token
  const tokenIndex = user.refreshTokens.findIndex(
    (rt) => rt.token === refreshToken
  );

  if (tokenIndex === -1) {
    // Token not found — it was either already used (rotation) or revoked.
    // This could indicate a stolen token being reused.
    // In a high-security system, you'd invalidate ALL refresh tokens here.
    throw ApiError.unauthorized('Refresh token not recognized — please log in again');
  }

  // Step 4: Remove the old refresh token (rotation)
  user.refreshTokens.splice(tokenIndex, 1);

  // Step 5: Generate new token pair
  const newTokens = generateTokenPair(user._id.toString(), user.role);

  // Step 6: Store the new refresh token
  user.refreshTokens.push({
    token: newTokens.refreshToken,
    deviceId,
    createdAt: new Date(),
  });

  await user.save();

  return {
    accessToken: newTokens.accessToken,
    refreshToken: newTokens.refreshToken,
  };
};

/**
 * Logout from the current device.
 *
 * Removes the refresh token for the specified device, effectively
 * ending the session on that device. Other devices remain logged in.
 *
 * @param {string} userId - User's MongoDB ID
 * @param {string} refreshToken - The refresh token to invalidate
 */
const logout = async (userId, refreshToken) => {
  const user = await User.findById(userId).select('+refreshTokens');

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Remove the specific refresh token
  user.refreshTokens = user.refreshTokens.filter(
    (rt) => rt.token !== refreshToken
  );

  user.isOnline = false;
  user.lastSeen = new Date();

  await user.save();
};

/**
 * Logout from ALL devices.
 *
 * Clears all refresh tokens — the user must log in again on every device.
 * Useful for security (user suspects account compromise) or password change.
 *
 * @param {string} userId - User's MongoDB ID
 */
const logoutAll = async (userId) => {
  const user = await User.findById(userId).select('+refreshTokens');

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  user.refreshTokens = [];
  user.isOnline = false;
  user.lastSeen = new Date();

  await user.save();
};

export default {
  sendOTP,
  verifyOTPAndLogin,
  register,
  googleLogin,
  refreshAccessToken,
  logout,
  logoutAll,
};
