/**
 * ==========================================================
 * FILE: src/routes/user.routes.js
 * ==========================================================
 *
 * WHY THIS FILE EXISTS:
 * ---------------------
 * Maps user self-management endpoints to their middleware chains
 * and controller methods. All routes here require authentication.
 *
 * HOW IT CONNECTS:
 * ----------------
 * - Mounted in app.js as: app.use('/api/v1/users', userRoutes)
 * - All routes pass through protect middleware first
 */

import { Router } from 'express';
import multer from 'multer';

// Controllers
import {
  getMyProfile,
  updateProfile,
  updateLocation,
  uploadProfilePhotos,
  deleteProfilePhoto,
  updateEmergencyContact,
  updateNotificationSettings,
  updatePrivacySettings,
  submitKYC,
  registerDeviceToken,
  deleteMyAccount,
  getUserById,
} from '../controllers/user.controller.js';

// Validators
import {
  updateProfileValidator,
  updateLocationValidator,
  updateEmergencyContactValidator,
  updateNotificationSettingsValidator,
  updatePrivacySettingsValidator,
  submitKYCValidator,
  registerDeviceTokenValidator,
  userIdParamValidator,
} from '../validators/user.validator.js';

// Middleware
import validate from '../middleware/validate.js';
import protect from '../middleware/auth.js';

const router = Router();

// ──────────────────────────────────────────────
// Multer Configuration (for photo uploads)
// ──────────────────────────────────────────────
/**
 * Multer stores uploaded files temporarily on disk before we upload
 * them to Cloudinary. We configure:
 * - Destination: src/uploads/ (temp storage)
 * - File filter: only images (jpeg, png, webp)
 * - Size limit: 5MB per file
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'src/uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// ──────────────────────────────────────────────
// All routes below require authentication
// ──────────────────────────────────────────────
router.use(protect);

// ── Profile ──
router.get('/me', getMyProfile);
router.put('/me', updateProfileValidator, validate, updateProfile);
router.delete('/me', deleteMyAccount);

// ── Location ──
router.put('/me/location', updateLocationValidator, validate, updateLocation);

// ── Photos ──
router.post('/me/photos', upload.array('photos', 4), uploadProfilePhotos);
router.delete('/me/photos/:photoId', deleteProfilePhoto);

// ── Emergency Contact ──
router.put('/me/emergency-contact', updateEmergencyContactValidator, validate, updateEmergencyContact);

// ── Settings ──
router.put('/me/notification-settings', updateNotificationSettingsValidator, validate, updateNotificationSettings);
router.put('/me/privacy-settings', updatePrivacySettingsValidator, validate, updatePrivacySettings);

// ── KYC ──
router.post('/me/kyc', submitKYCValidator, validate, submitKYC);

// ── Device Token ──
router.post('/me/device-token', registerDeviceTokenValidator, validate, registerDeviceToken);

// ── Public Profile (view another user) ──
router.get('/:userId', userIdParamValidator, validate, getUserById);

export default router;
