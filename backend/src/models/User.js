/**
 * ==========================================================
 * FILE: src/models/User.js
 * ==========================================================
 *
 * WHY THIS FILE EXISTS:
 * ---------------------
 * The User model is the foundation of the entire Companion platform.
 * Every other model (Booking, CompanionProfile, Chat, Review, Report)
 * references a User. This is also the most security-critical model
 * because it stores authentication credentials, KYC data, location,
 * and emergency contact information.
 *
 * Design principles:
 * 1. SECURITY FIRST — passwords never leave the DB (select: false),
 *    refresh tokens are stored per-device for granular revocation
 * 2. SAFETY — emergency contact, KYC status, trust score, ban system
 * 3. FLEXIBILITY — role switching (client ↔ companion), multiple auth
 *    providers, privacy controls
 * 4. PERFORMANCE — strategic indexes on frequently queried fields,
 *    2dsphere index for geospatial proximity queries
 *
 * HOW IT CONNECTS:
 * ----------------
 * - auth.service.js creates/queries users during login flows
 * - auth.js middleware queries by userId from JWT payload
 * - CompanionProfile.userId is a 1:1 reference to this model
 * - Booking references clientId and companionId (both Users)
 * - Chat, Review, Report all reference Users
 * - Trust score is updated by review.service and report.service
 *
 * NOTE: This replaces the old src/modles/user.js which had only 5 fields.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import {
  USER_ROLES,
  USER_ROLES_ARRAY,
  GENDER,
  GENDER_ARRAY,
  AUTH_PROVIDERS,
  AUTH_PROVIDERS_ARRAY,
  KYC_STATUS,
  KYC_STATUS_ARRAY,
  KYC_DOCUMENT_TYPES_ARRAY,
  TRUST_SCORE,
  PLATFORM_CONFIG,
} from '../constants/index.js';
import { calculateAge } from '../utils/helpers.js';

const { Schema } = mongoose;

// ──────────────────────────────────────────────
// Sub-Schemas
// ──────────────────────────────────────────────
// These are embedded document schemas used within the User document.
// They're defined separately for readability and reusability.

/**
 * Profile photo sub-schema.
 * Each photo is stored in Cloudinary and referenced by URL + publicId.
 * The publicId is needed for deletion from Cloudinary.
 */
const profilePhotoSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

/**
 * KYC documents sub-schema.
 * For identity verification, users upload government ID front/back
 * and a selfie for face matching.
 */
const kycDocumentSchema = new Schema(
  {
    documentType: {
      type: String,
      enum: KYC_DOCUMENT_TYPES_ARRAY,
    },
    frontUrl: { type: String },
    backUrl: { type: String },
    selfieUrl: { type: String },
  },
  { _id: false }
);

/**
 * Emergency contact sub-schema.
 * Mandatory for safety — used by the SOS system to notify a
 * trusted person if the user triggers an emergency alert.
 */
const emergencyContactSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Invalid Indian phone number'],
    },
    relation: {
      type: String,
      trim: true,
      maxlength: 50,
    },
  },
  { _id: false }
);

/**
 * Refresh token sub-schema.
 * Stored per-device to support:
 * 1. Multi-device login (phone + laptop simultaneously)
 * 2. Selective logout (log out just the phone, keep laptop active)
 * 3. Security audit (see all active sessions)
 */
const refreshTokenSchema = new Schema(
  {
    token: {
      type: String,
      required: true,
    },
    deviceId: {
      type: String,
      default: 'unknown',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

// ──────────────────────────────────────────────
// Main User Schema
// ──────────────────────────────────────────────
const userSchema = new Schema(
  {
    // ── Identity ──
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email address'],
    },

    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Invalid Indian phone number'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      // CRITICAL: `select: false` means this field is EXCLUDED from all
      // queries by default. You must explicitly use .select('+password')
      // when you need to compare passwords (login flow).
      select: false,
    },

    // ── Authentication ──
    authProvider: {
      type: String,
      enum: {
        values: AUTH_PROVIDERS_ARRAY,
        message: 'Auth provider must be one of: {VALUE}',
      },
      default: AUTH_PROVIDERS.PHONE,
    },

    googleId: {
      type: String,
      sparse: true, // Allows null/undefined values while maintaining uniqueness
    },

    // ── Role System ──
    // Users start as 'client'. They can apply to become a 'companion'.
    // 'admin' is set manually via database or seed script.
    role: {
      type: String,
      enum: {
        values: USER_ROLES_ARRAY,
        message: 'Role must be one of: {VALUE}',
      },
      default: USER_ROLES.CLIENT,
    },

    // ── Profile ──
    dob: {
      type: Date,
      required: [true, 'Date of birth is required'],
      validate: {
        validator: function (value) {
          // Enforce minimum age of 18 years
          return calculateAge(value) >= PLATFORM_CONFIG.MIN_AGE;
        },
        message: `You must be at least ${PLATFORM_CONFIG.MIN_AGE} years old`,
      },
    },

    gender: {
      type: String,
      enum: {
        values: GENDER_ARRAY,
        message: 'Gender must be one of: {VALUE}',
      },
      default: GENDER.PREFER_NOT_TO_SAY,
    },

    bio: {
      type: String,
      trim: true,
      maxlength: [PLATFORM_CONFIG.BIO_MAX_LENGTH, `Bio cannot exceed ${PLATFORM_CONFIG.BIO_MAX_LENGTH} characters`],
      default: '',
    },

    // Primary display photo URL — typically the first profilePhoto
    avatar: {
      type: String,
      default: '',
    },

    // Array of uploaded profile photos (Cloudinary URLs + publicIds)
    profilePhotos: {
      type: [profilePhotoSchema],
      validate: {
        validator: function (photos) {
          // Validation only runs when the array is non-empty
          // (we don't require photos at registration — they're added during onboarding)
          return photos.length <= PLATFORM_CONFIG.MAX_PROFILE_PHOTOS;
        },
        message: `Maximum ${PLATFORM_CONFIG.MAX_PROFILE_PHOTOS} profile photos allowed`,
      },
      default: [],
    },

    // ── Location (GeoJSON) ──
    // GeoJSON Point format required by MongoDB's 2dsphere index.
    // coordinates = [longitude, latitude] — NOT [lat, lng]!
    // This is a common gotcha: MongoDB uses [lng, lat] (GeoJSON standard).
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
      },
    },

    city: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    state: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    // ── KYC (Know Your Customer) ──
    kycStatus: {
      type: String,
      enum: {
        values: KYC_STATUS_ARRAY,
        message: 'KYC status must be one of: {VALUE}',
      },
      default: KYC_STATUS.NOT_SUBMITTED,
    },

    kycDocuments: {
      type: kycDocumentSchema,
      default: () => ({}),
    },

    kycRejectionReason: {
      type: String,
      trim: true,
    },

    // ── Safety ──
    emergencyContact: {
      type: emergencyContactSchema,
      default: () => ({}),
    },

    trustScore: {
      type: Number,
      default: TRUST_SCORE.DEFAULT,
      min: [TRUST_SCORE.MIN, 'Trust score cannot go below 0'],
      max: [TRUST_SCORE.MAX, 'Trust score cannot exceed 100'],
    },

    // ── Verification Flags ──
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    // ── Online Presence ──
    isOnline: {
      type: Boolean,
      default: false,
    },

    lastSeen: {
      type: Date,
      default: Date.now,
    },

    // ── Push Notifications (Firebase) ──
    // Array of device tokens — one user can have multiple devices
    deviceTokens: {
      type: [String],
      default: [],
    },

    // ── Settings ──
    notificationSettings: {
      push: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
    },

    privacySettings: {
      showOnlineStatus: { type: Boolean, default: true },
      showLastSeen: { type: Boolean, default: true },
      showLocation: { type: Boolean, default: true },
    },

    // ── Tokens (Multi-device sessions) ──
    refreshTokens: {
      type: [refreshTokenSchema],
      select: false, // Don't include in default queries for security
    },

    // ── Stats ──
    profileCompletion: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    totalBookings: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalEarnings: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalSpent: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ── Ban System ──
    isBanned: {
      type: Boolean,
      default: false,
    },

    banReason: {
      type: String,
      trim: true,
    },

    bannedAt: {
      type: Date,
    },

    bannedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    // ── Soft Delete ──
    // We never hard-delete users — we mark them as deleted.
    // This preserves referential integrity (bookings, reviews, chats)
    // and allows account recovery within a grace period.
    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically

    // Enable virtuals in JSON/Object serialization
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ──────────────────────────────────────────────
// Indexes
// ──────────────────────────────────────────────
// MongoDB indexes speed up queries dramatically. Without them,
// every query does a full collection scan.

// 2dsphere index for geospatial queries (find companions near me)
userSchema.index({ location: '2dsphere' });

// Compound index for the most common admin query:
// "Show me all active, non-banned users"
userSchema.index({ isDeleted: 1, isBanned: 1 });

// Role-based queries (list all companions, all admins)
userSchema.index({ role: 1 });

// KYC status queries (admin reviews pending KYC applications)
userSchema.index({ kycStatus: 1 });

// ──────────────────────────────────────────────
// Virtuals
// ──────────────────────────────────────────────
// Virtual properties are computed on-the-fly and not stored in the DB.

/**
 * Calculate age from date of birth.
 * Accessible as user.age in code and included in JSON responses
 * (because of toJSON: { virtuals: true } above).
 */
userSchema.virtual('age').get(function () {
  if (!this.dob) return null;
  return calculateAge(this.dob);
});

// ──────────────────────────────────────────────
// Pre-Save Hook: Password Hashing
// ──────────────────────────────────────────────
/**
 * Before saving, if the password field was modified (set or changed),
 * hash it with bcrypt. The `isModified` check prevents re-hashing
 * an already-hashed password when updating other fields.
 *
 * Salt rounds = 12: This means bcrypt performs 2^12 = 4096 iterations.
 * Higher = slower hashing = more resistant to brute force, but also
 * slower login. 12 is the industry standard balance.
 */
userSchema.pre('save', async function (next) {
  // Only hash if password was actually modified
  if (!this.isModified('password')) return next();

  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12;
  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

/**
 * Before saving, recalculate profile completion percentage.
 * This runs on every save to keep the score current without
 * requiring a separate update call.
 */
userSchema.pre('save', function (next) {
  this.profileCompletion = this.calculateProfileCompletion();
  next();
});

// ──────────────────────────────────────────────
// Instance Methods
// ──────────────────────────────────────────────

/**
 * Compare a candidate password against the stored hash.
 *
 * IMPORTANT: The password field has `select: false`, so you must
 * explicitly include it in the query before calling this:
 *   const user = await User.findById(id).select('+password');
 *   const isMatch = await user.comparePassword(candidatePassword);
 *
 * @param {string} candidatePassword - Plain text password from login form
 * @returns {Promise<boolean>} True if password matches
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Calculate how complete the user's profile is, as a percentage (0-100).
 *
 * Each section contributes a fixed number of points:
 * - fullName: 10
 * - email verified: 10
 * - phone verified: 10
 * - dob + gender: 10
 * - bio: 10
 * - profile photos (at least 2): 15
 * - avatar: 5
 * - location: 10
 * - emergency contact: 10
 * - KYC verified: 10
 *
 * This method is called in the pre-save hook to auto-update the score.
 *
 * @returns {number} Profile completion percentage (0-100)
 */
userSchema.methods.calculateProfileCompletion = function () {
  let score = 0;

  if (this.fullName && this.fullName.length >= 2) score += 10;
  if (this.isEmailVerified) score += 10;
  if (this.isPhoneVerified) score += 10;
  if (this.dob && this.gender && this.gender !== GENDER.PREFER_NOT_TO_SAY) score += 10;
  if (this.bio && this.bio.length > 0) score += 10;
  if (this.profilePhotos && this.profilePhotos.length >= PLATFORM_CONFIG.MIN_PROFILE_PHOTOS) score += 15;
  if (this.avatar) score += 5;
  if (this.location && this.location.coordinates && this.location.coordinates.length === 2) score += 10;
  if (this.emergencyContact && this.emergencyContact.name && this.emergencyContact.phone) score += 10;
  if (this.kycStatus === KYC_STATUS.VERIFIED) score += 10;

  return score;
};

// ──────────────────────────────────────────────
// Query Middleware
// ──────────────────────────────────────────────
/**
 * Automatically exclude soft-deleted users from all find queries.
 *
 * This is a query middleware (not document middleware) — it runs
 * before every find(), findOne(), findById(), countDocuments(), etc.
 *
 * To include deleted users (e.g. admin panel), you can override:
 *   User.find({ isDeleted: true })
 *
 * The regex matches any method starting with "find" — covers
 * find, findOne, findById, findOneAndUpdate, findOneAndDelete, etc.
 */
userSchema.pre(/^find/, function (next) {
  // Only add the filter if the query doesn't already specify isDeleted
  if (this.getFilter().isDeleted === undefined) {
    this.where({ isDeleted: false });
  }
  next();
});

// ──────────────────────────────────────────────
// Model Export
// ──────────────────────────────────────────────
const User = mongoose.model('User', userSchema);

export default User;
