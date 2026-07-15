/**
 * ==========================================================
 * FILE: src/controllers/user.controller.js
 * ==========================================================
 *
 * WHY THIS FILE EXISTS:
 * ---------------------
 * Handles user self-management operations. These are endpoints that
 * authenticated users call to manage their own profile:
 *
 * - Get my profile
 * - Update my profile (name, bio, dob, gender)
 * - Update my location
 * - Upload profile photos
 * - Set emergency contact
 * - Update notification/privacy settings
 * - Submit KYC documents
 * - Register device token for push notifications
 * - Soft-delete my account
 *
 * HOW IT CONNECTS:
 * ----------------
 * - user.routes.js maps endpoints to these methods
 * - All endpoints require authentication (protect middleware)
 * - req.user is set by auth.js middleware
 * - Uses cloudinary for photo uploads
 */

import User from '../models/User.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sanitizeUser } from '../utils/helpers.js';
import { KYC_STATUS } from '../constants/index.js';
import cloudinary from '../config/cloudinary.js';

/**
 * @route   GET /api/v1/users/me
 * @desc    Get current user's profile
 * @access  Private
 */
export const getMyProfile = asyncHandler(async (req, res) => {
  // req.user is already populated by auth middleware,
  // but we fetch fresh data to ensure it's current
  const user = await User.findById(req.user._id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  res.status(200).json(
    new ApiResponse(200, sanitizeUser(user), 'Profile fetched successfully')
  );
});

/**
 * @route   PUT /api/v1/users/me
 * @desc    Update current user's profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  // Only allow updating specific fields — prevent role escalation,
  // ban manipulation, etc.
  const allowedFields = ['fullName', 'bio', 'gender', 'dob', 'city', 'state'];
  const updates = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  // If dob is being updated, convert to Date
  if (updates.dob) {
    updates.dob = new Date(updates.dob);
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  res.status(200).json(
    new ApiResponse(200, sanitizeUser(user), 'Profile updated successfully')
  );
});

/**
 * @route   PUT /api/v1/users/me/location
 * @desc    Update current user's location (GeoJSON)
 * @access  Private
 */
export const updateLocation = asyncHandler(async (req, res) => {
  const { longitude, latitude } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        location: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)],
        },
      },
    },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  res.status(200).json(
    new ApiResponse(200, {
      location: user.location,
    }, 'Location updated successfully')
  );
});

/**
 * @route   POST /api/v1/users/me/photos
 * @desc    Upload profile photos (handled by Multer + Cloudinary)
 * @access  Private
 *
 * This expects multipart/form-data with files under the 'photos' field.
 * Multer middleware (configured in routes) processes the upload first.
 */
export const uploadProfilePhotos = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw ApiError.badRequest('No photos provided');
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Check total photo count won't exceed limit
  const currentCount = user.profilePhotos.length;
  const newCount = req.files.length;
  const maxPhotos = parseInt(process.env.MAX_PROFILE_PHOTOS, 10) || 4;

  if (currentCount + newCount > maxPhotos) {
    throw ApiError.badRequest(
      `Maximum ${maxPhotos} photos allowed. You have ${currentCount} — can add ${maxPhotos - currentCount} more.`
    );
  }

  // Upload each file to Cloudinary
  const uploadedPhotos = [];
  for (const file of req.files) {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'companion/profiles',
      transformation: [
        { width: 800, height: 800, crop: 'limit', quality: 'auto' },
      ],
    });

    uploadedPhotos.push({
      url: result.secure_url,
      publicId: result.public_id,
    });
  }

  // Add to user's photos
  user.profilePhotos.push(...uploadedPhotos);

  // Set avatar to first photo if not set
  if (!user.avatar && uploadedPhotos.length > 0) {
    user.avatar = uploadedPhotos[0].url;
  }

  await user.save();

  res.status(200).json(
    new ApiResponse(200, {
      profilePhotos: user.profilePhotos,
      avatar: user.avatar,
    }, 'Photos uploaded successfully')
  );
});

/**
 * @route   DELETE /api/v1/users/me/photos/:photoId
 * @desc    Delete a profile photo
 * @access  Private
 */
export const deleteProfilePhoto = asyncHandler(async (req, res) => {
  const { photoId } = req.params;
  const user = await User.findById(req.user._id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const photoIndex = user.profilePhotos.findIndex(
    (p) => p.publicId === photoId
  );

  if (photoIndex === -1) {
    throw ApiError.notFound('Photo not found');
  }

  // Delete from Cloudinary
  await cloudinary.uploader.destroy(photoId);

  // Remove from array
  const removedPhoto = user.profilePhotos.splice(photoIndex, 1)[0];

  // If the deleted photo was the avatar, set avatar to the next photo
  if (user.avatar === removedPhoto.url) {
    user.avatar = user.profilePhotos.length > 0
      ? user.profilePhotos[0].url
      : '';
  }

  await user.save();

  res.status(200).json(
    new ApiResponse(200, {
      profilePhotos: user.profilePhotos,
      avatar: user.avatar,
    }, 'Photo deleted successfully')
  );
});

/**
 * @route   PUT /api/v1/users/me/emergency-contact
 * @desc    Update emergency contact
 * @access  Private
 */
export const updateEmergencyContact = asyncHandler(async (req, res) => {
  const { name, phone, relation } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        emergencyContact: { name, phone, relation },
      },
    },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  res.status(200).json(
    new ApiResponse(200, {
      emergencyContact: user.emergencyContact,
    }, 'Emergency contact updated successfully')
  );
});

/**
 * @route   PUT /api/v1/users/me/notification-settings
 * @desc    Update notification preferences
 * @access  Private
 */
export const updateNotificationSettings = asyncHandler(async (req, res) => {
  const { push, email, sms } = req.body;
  const updates = {};

  if (push !== undefined) updates['notificationSettings.push'] = push;
  if (email !== undefined) updates['notificationSettings.email'] = email;
  if (sms !== undefined) updates['notificationSettings.sms'] = sms;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    { new: true }
  );

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  res.status(200).json(
    new ApiResponse(200, {
      notificationSettings: user.notificationSettings,
    }, 'Notification settings updated')
  );
});

/**
 * @route   PUT /api/v1/users/me/privacy-settings
 * @desc    Update privacy preferences
 * @access  Private
 */
export const updatePrivacySettings = asyncHandler(async (req, res) => {
  const { showOnlineStatus, showLastSeen, showLocation } = req.body;
  const updates = {};

  if (showOnlineStatus !== undefined) updates['privacySettings.showOnlineStatus'] = showOnlineStatus;
  if (showLastSeen !== undefined) updates['privacySettings.showLastSeen'] = showLastSeen;
  if (showLocation !== undefined) updates['privacySettings.showLocation'] = showLocation;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    { new: true }
  );

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  res.status(200).json(
    new ApiResponse(200, {
      privacySettings: user.privacySettings,
    }, 'Privacy settings updated')
  );
});

/**
 * @route   POST /api/v1/users/me/kyc
 * @desc    Submit KYC documents for verification
 * @access  Private
 */
export const submitKYC = asyncHandler(async (req, res) => {
  const { documentType, frontUrl, backUrl, selfieUrl } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Prevent re-submission if already verified
  if (user.kycStatus === KYC_STATUS.VERIFIED) {
    throw ApiError.badRequest('KYC is already verified');
  }

  user.kycDocuments = { documentType, frontUrl, backUrl, selfieUrl };
  user.kycStatus = KYC_STATUS.PENDING;
  user.kycRejectionReason = undefined;

  await user.save();

  res.status(200).json(
    new ApiResponse(200, {
      kycStatus: user.kycStatus,
    }, 'KYC documents submitted — under review')
  );
});

/**
 * @route   POST /api/v1/users/me/device-token
 * @desc    Register device token for push notifications
 * @access  Private
 */
export const registerDeviceToken = asyncHandler(async (req, res) => {
  const { deviceToken } = req.body;

  // Use $addToSet to prevent duplicates
  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { deviceTokens: deviceToken },
  });

  res.status(200).json(
    new ApiResponse(200, null, 'Device token registered')
  );
});

/**
 * @route   DELETE /api/v1/users/me
 * @desc    Soft-delete current user's account
 * @access  Private
 */
export const deleteMyAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Soft delete — don't remove from DB
  user.isDeleted = true;
  user.deletedAt = new Date();
  user.isOnline = false;

  await user.save();

  // Clear refresh token cookie
  res.clearCookie('refreshToken');

  res.status(200).json(
    new ApiResponse(200, null, 'Account deleted successfully')
  );
});

/**
 * @route   GET /api/v1/users/:userId
 * @desc    Get a user's public profile (limited fields)
 * @access  Private
 */
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId).select(
    'fullName avatar bio gender age city state isOnline lastSeen trustScore profilePhotos'
  );

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Respect privacy settings
  const publicProfile = user.toObject();
  if (!user.privacySettings?.showOnlineStatus) {
    delete publicProfile.isOnline;
  }
  if (!user.privacySettings?.showLastSeen) {
    delete publicProfile.lastSeen;
  }

  res.status(200).json(
    new ApiResponse(200, publicProfile, 'User profile fetched')
  );
});
