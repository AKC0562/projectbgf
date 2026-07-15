/**
 * ==========================================================
 * FILE: src/models/CompanionProfile.js
 * ==========================================================
 *
 * WHY THIS FILE EXISTS:
 * ---------------------
 * The CompanionProfile is a SEPARATE model from User, connected via a
 * 1:1 relationship (userId). This separation follows a key design principle:
 *
 * NOT every user is a companion. Most users are clients. If we embedded
 * all companion-specific fields (hourly rate, availability, categories,
 * portfolio) into the User model, we'd be bloating every user document
 * with fields that 80% of users never use.
 *
 * By keeping CompanionProfile separate:
 * 1. User documents stay lean for non-companions
 * 2. Companion-specific queries only hit the CompanionProfile collection
 * 3. We can apply companion-specific indexes without affecting User
 * 4. The companion "application" flow is cleaner — create a profile,
 *    submit for verification, get approved
 *
 * HOW IT CONNECTS:
 * ----------------
 * - userId references User model (1:1 unique relationship)
 * - categories references Category model (many-to-many)
 * - booking.service.js checks CompanionProfile for availability and rates
 * - companion.controller.js handles CRUD for this model
 * - Search/discovery endpoints query this model with geo, category, and
 *   rating filters
 */

import mongoose from 'mongoose';
import {
  DAYS_OF_WEEK,
  PLATFORM_CONFIG,
} from '../constants/index.js';

const { Schema } = mongoose;

// ──────────────────────────────────────────────
// Sub-Schemas
// ──────────────────────────────────────────────

/**
 * Availability slot sub-schema.
 * Each slot represents a time range on a specific day when the companion
 * is available for bookings. A companion might have:
 * - Monday: 10:00 - 14:00
 * - Monday: 18:00 - 22:00 (two slots on the same day)
 * - Saturday: 09:00 - 20:00
 *
 * Times are stored as strings in 24h format ("09:00", "18:30") because:
 * - They're timezone-independent display values
 * - The actual booking time validation happens in booking.service.js
 */
const availabilitySchema = new Schema(
  {
    dayOfWeek: {
      type: String,
      required: true,
      enum: {
        values: DAYS_OF_WEEK,
        message: 'Day must be one of: {VALUE}',
      },
    },
    startTime: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'Start time must be in HH:MM format'],
    },
    endTime: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'End time must be in HH:MM format'],
    },
  },
  { _id: false }
);

/**
 * Preferred venue sub-schema.
 * Safety feature: Companion lists public venues where they prefer to meet.
 * The platform enforces meetings at verified public locations.
 */
const preferredVenueSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    address: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
      },
    },
  },
  { _id: false }
);

/**
 * Portfolio photo sub-schema.
 * Companions can showcase their activities (coffee meetups, gym sessions,
 * study group photos) — helps clients choose the right companion.
 */
const portfolioPhotoSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      trim: true,
      maxlength: 200,
    },
  },
  { _id: false }
);

// ──────────────────────────────────────────────
// Main CompanionProfile Schema
// ──────────────────────────────────────────────
const companionProfileSchema = new Schema(
  {
    // ── Owner Reference ──
    // 1:1 relationship with User. Unique constraint ensures a user
    // can only have one companion profile.
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
    },

    // ── Display Info ──
    displayName: {
      type: String,
      trim: true,
      maxlength: [100, 'Display name cannot exceed 100 characters'],
    },

    tagline: {
      type: String,
      trim: true,
      maxlength: [PLATFORM_CONFIG.TAGLINE_MAX_LENGTH, `Tagline cannot exceed ${PLATFORM_CONFIG.TAGLINE_MAX_LENGTH} characters`],
    },

    // ── Services ──
    // Array of category references — what activities this companion offers
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],

    // ── Pricing ──
    hourlyRate: {
      type: Number,
      required: [true, 'Hourly rate is required'],
      min: [PLATFORM_CONFIG.MIN_HOURLY_RATE, `Minimum hourly rate is ₹${PLATFORM_CONFIG.MIN_HOURLY_RATE}`],
      max: [PLATFORM_CONFIG.MAX_HOURLY_RATE, `Maximum hourly rate is ₹${PLATFORM_CONFIG.MAX_HOURLY_RATE}`],
    },

    // ── Scheduling ──
    availability: {
      type: [availabilitySchema],
      default: [],
    },

    // ── Personal Details ──
    languages: {
      type: [String],
      default: [],
      validate: {
        validator: (langs) => langs.length <= 10,
        message: 'Maximum 10 languages allowed',
      },
    },

    interests: {
      type: [String],
      default: [],
      validate: {
        validator: (interests) => interests.length <= 20,
        message: 'Maximum 20 interests allowed',
      },
    },

    experience: {
      type: String,
      trim: true,
      maxlength: [1000, 'Experience description cannot exceed 1000 characters'],
    },

    // ── Performance Metrics ──
    // These are denormalized (calculated and stored) rather than
    // computed on every query, because they're displayed on search
    // results — computing them per search result would be too expensive.

    responseTime: {
      type: Number, // Average response time in minutes
      default: 0,
      min: 0,
    },

    acceptanceRate: {
      type: Number, // Percentage (0-100)
      default: 0,
      min: 0,
      max: 100,
    },

    totalRatings: {
      type: Number,
      default: 0,
      min: 0,
    },

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalCompletedBookings: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ── Visibility & Verification ──
    // isActive: Companion can toggle this themselves (go offline/online)
    // isVerified: Only admin can set this (after reviewing profile/KYC)
    isActive: {
      type: Boolean,
      default: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verifiedAt: {
      type: Date,
    },

    // ── Venues & Portfolio ──
    preferredVenues: {
      type: [preferredVenueSchema],
      default: [],
      validate: {
        validator: (venues) => venues.length <= 10,
        message: 'Maximum 10 preferred venues allowed',
      },
    },

    portfolioPhotos: {
      type: [portfolioPhotoSchema],
      default: [],
      validate: {
        validator: (photos) => photos.length <= PLATFORM_CONFIG.MAX_PORTFOLIO_PHOTOS,
        message: `Maximum ${PLATFORM_CONFIG.MAX_PORTFOLIO_PHOTOS} portfolio photos allowed`,
      },
    },

    // ── Location (Companion's service area) ──
    // Used for geo-queries: "Find companions near me"
    serviceLocation: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
      },
    },

    serviceRadius: {
      type: Number, // in kilometers
      default: 25,
      min: 1,
      max: 100,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ──────────────────────────────────────────────
// Indexes
// ──────────────────────────────────────────────

// Unique index on userId — one companion profile per user
// (Already enforced by `unique: true` on the field, but explicit for clarity)

// Geospatial index for proximity search
companionProfileSchema.index({ serviceLocation: '2dsphere' });

// Compound index for the search query:
// "Show me active, verified companions sorted by rating"
companionProfileSchema.index({ isActive: 1, isVerified: 1, averageRating: -1 });

// Category-based search
companionProfileSchema.index({ categories: 1 });

// Price range search
companionProfileSchema.index({ hourlyRate: 1 });

// ──────────────────────────────────────────────
// Methods
// ──────────────────────────────────────────────

/**
 * Check if the companion is available on a given day and time range.
 *
 * @param {string} dayOfWeek - e.g. 'monday'
 * @param {string} startTime - e.g. '10:00'
 * @param {string} endTime - e.g. '12:00'
 * @returns {boolean}
 */
companionProfileSchema.methods.isAvailableAt = function (dayOfWeek, startTime, endTime) {
  return this.availability.some(
    (slot) =>
      slot.dayOfWeek === dayOfWeek &&
      slot.startTime <= startTime &&
      slot.endTime >= endTime
  );
};

/**
 * Update the average rating.
 * Called by review.service after a new review is submitted.
 *
 * Uses the incremental average formula to avoid re-querying all reviews:
 * newAvg = ((oldAvg * oldCount) + newRating) / newCount
 *
 * @param {number} newRating - The new review's rating (1-5)
 */
companionProfileSchema.methods.updateRating = function (newRating) {
  const newTotal = this.totalRatings + 1;
  this.averageRating =
    (this.averageRating * this.totalRatings + newRating) / newTotal;
  this.totalRatings = newTotal;
};

const CompanionProfile = mongoose.model('CompanionProfile', companionProfileSchema);

export default CompanionProfile;
