/**
 * ==========================================================
 * FILE: src/constants/index.js
 * ==========================================================
 *
 * WHY THIS FILE EXISTS:
 * ---------------------
 * Every production backend has "magic values" — role names, booking statuses,
 * KYC states, report reasons, etc. If these strings are scattered across
 * controllers, models, and services, a single typo (e.g. "comapnion" vs "companion")
 * creates a silent bug that only surfaces in production.
 *
 * This file is the **single source of truth** for every enumerated value in
 * the system. Every model enum, every status check, every role comparison
 * imports from here. Change it in one place, it changes everywhere.
 *
 * HOW IT CONNECTS:
 * ----------------
 * - Models use these enums in their `enum` field validators
 * - Middleware (authorize) checks against USER_ROLES
 * - Services check BOOKING_STATUS transitions
 * - Controllers reference HTTP_STATUS codes
 * - Socket handlers use MESSAGE_TYPES
 * - Chat moderation uses MODERATION_KEYWORDS
 */

// ──────────────────────────────────────────────
// User Roles
// ──────────────────────────────────────────────
export const USER_ROLES = Object.freeze({
  CLIENT: 'client',
  COMPANION: 'companion',
  ADMIN: 'admin',
});

export const USER_ROLES_ARRAY = Object.values(USER_ROLES);

// ──────────────────────────────────────────────
// Gender Options
// ──────────────────────────────────────────────
export const GENDER = Object.freeze({
  MALE: 'male',
  FEMALE: 'female',
  NON_BINARY: 'non_binary',
  PREFER_NOT_TO_SAY: 'prefer_not_to_say',
});

export const GENDER_ARRAY = Object.values(GENDER);

// ──────────────────────────────────────────────
// Authentication Providers
// ──────────────────────────────────────────────
export const AUTH_PROVIDERS = Object.freeze({
  PHONE: 'phone',
  GOOGLE: 'google',
});

export const AUTH_PROVIDERS_ARRAY = Object.values(AUTH_PROVIDERS);

// ──────────────────────────────────────────────
// KYC Status
// ──────────────────────────────────────────────
export const KYC_STATUS = Object.freeze({
  NOT_SUBMITTED: 'not_submitted',
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
});

export const KYC_STATUS_ARRAY = Object.values(KYC_STATUS);

// ──────────────────────────────────────────────
// KYC Document Types
// ──────────────────────────────────────────────
export const KYC_DOCUMENT_TYPES = Object.freeze({
  AADHAAR: 'aadhaar',
  PAN: 'pan',
  DRIVING_LICENSE: 'driving_license',
  PASSPORT: 'passport',
});

export const KYC_DOCUMENT_TYPES_ARRAY = Object.values(KYC_DOCUMENT_TYPES);

// ──────────────────────────────────────────────
// Booking Statuses
// ──────────────────────────────────────────────
export const BOOKING_STATUS = Object.freeze({
  REQUESTED: 'requested',
  ACCEPTED: 'accepted',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DISPUTED: 'disputed',
});

export const BOOKING_STATUS_ARRAY = Object.values(BOOKING_STATUS);

/**
 * Defines which status transitions are valid from each state.
 * Used by booking.service.js to prevent illegal state changes
 * (e.g. you can't go from "completed" back to "ongoing").
 */
export const BOOKING_STATUS_TRANSITIONS = Object.freeze({
  [BOOKING_STATUS.REQUESTED]: [BOOKING_STATUS.ACCEPTED, BOOKING_STATUS.CANCELLED],
  [BOOKING_STATUS.ACCEPTED]: [BOOKING_STATUS.ONGOING, BOOKING_STATUS.CANCELLED],
  [BOOKING_STATUS.ONGOING]: [BOOKING_STATUS.COMPLETED, BOOKING_STATUS.DISPUTED],
  [BOOKING_STATUS.COMPLETED]: [],
  [BOOKING_STATUS.CANCELLED]: [],
  [BOOKING_STATUS.DISPUTED]: [BOOKING_STATUS.COMPLETED, BOOKING_STATUS.CANCELLED],
});

// ──────────────────────────────────────────────
// Payment Statuses
// ──────────────────────────────────────────────
export const PAYMENT_STATUS = Object.freeze({
  PENDING: 'pending',
  ESCROW: 'escrow',
  RELEASED: 'released',
  REFUNDED: 'refunded',
  FAILED: 'failed',
});

export const PAYMENT_STATUS_ARRAY = Object.values(PAYMENT_STATUS);

// ──────────────────────────────────────────────
// Category Slugs (Companion Activity Types)
// ──────────────────────────────────────────────
export const CATEGORY_SLUGS = Object.freeze({
  COFFEE: 'coffee-companion',
  STUDY: 'study-buddy',
  GYM: 'gym-partner',
  SHOPPING: 'shopping-buddy',
  MOVIE: 'movie-companion',
  WEDDING: 'wedding-plus-one',
  FESTIVAL: 'festival-companion',
  CONVERSATION: 'conversation-partner',
  VIDEO_CALL: 'video-call-companion',
});

export const CATEGORY_SLUGS_ARRAY = Object.values(CATEGORY_SLUGS);

// ──────────────────────────────────────────────
// Report Reasons
// ──────────────────────────────────────────────
export const REPORT_REASONS = Object.freeze({
  HARASSMENT: 'harassment',
  INAPPROPRIATE_BEHAVIOR: 'inappropriate_behavior',
  FAKE_PROFILE: 'fake_profile',
  NO_SHOW: 'no_show',
  SAFETY_CONCERN: 'safety_concern',
  SPAM: 'spam',
  UNDERAGE: 'underage',
  SOLICITATION: 'solicitation',
  SUBSTANCE_ABUSE: 'substance_abuse',
  OTHER: 'other',
});

export const REPORT_REASONS_ARRAY = Object.values(REPORT_REASONS);

// ──────────────────────────────────────────────
// Report Status
// ──────────────────────────────────────────────
export const REPORT_STATUS = Object.freeze({
  PENDING: 'pending',
  INVESTIGATING: 'investigating',
  RESOLVED: 'resolved',
  DISMISSED: 'dismissed',
});

export const REPORT_STATUS_ARRAY = Object.values(REPORT_STATUS);

// ──────────────────────────────────────────────
// Message Types (Chat)
// ──────────────────────────────────────────────
export const MESSAGE_TYPES = Object.freeze({
  TEXT: 'text',
  IMAGE: 'image',
  SYSTEM: 'system',
});

export const MESSAGE_TYPES_ARRAY = Object.values(MESSAGE_TYPES);

// ──────────────────────────────────────────────
// Review Tags
// ──────────────────────────────────────────────
export const REVIEW_TAGS = Object.freeze([
  'punctual',
  'friendly',
  'professional',
  'great_conversation',
  'respectful',
  'fun',
  'knowledgeable',
  'reliable',
  'good_listener',
  'would_book_again',
]);

// ──────────────────────────────────────────────
// Days of Week (Availability Scheduling)
// ──────────────────────────────────────────────
export const DAYS_OF_WEEK = Object.freeze([
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]);

// ──────────────────────────────────────────────
// HTTP Status Codes
// ──────────────────────────────────────────────
export const HTTP_STATUS = Object.freeze({
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
});

// ──────────────────────────────────────────────
// Moderation Keywords
// ──────────────────────────────────────────────
/**
 * This is NOT a comprehensive list — in production, you'd integrate a
 * moderation API (e.g. Google Perspective, OpenAI Moderation). This
 * serves as a first-pass filter for the chat keyword moderation
 * middleware to flag obviously inappropriate messages.
 *
 * Categories:
 * - Romantic/sexual solicitation terms
 * - Profanity
 * - Substance-related
 *
 * All lowercase — messages are lowercased before comparison.
 */
export const MODERATION_KEYWORDS = Object.freeze([
  // Romantic/sexual solicitation
  'hookup', 'hook up', 'one night', 'fwb', 'friends with benefits',
  'sugar daddy', 'sugar mommy', 'sugar baby', 'escort', 'paid date',
  'intimate', 'sexual', 'xxx', 'nude', 'nudes', 'sexy',
  'bedroom', 'hotel room', 'my place', 'your place',

  // Profanity (basic set — extend or use API)
  'fuck', 'shit', 'asshole', 'bitch', 'dick', 'bastard',

  // Substance
  'drugs', 'weed', 'cocaine', 'meth', 'heroin', 'mdma',
]);

// ──────────────────────────────────────────────
// Pagination Defaults
// ──────────────────────────────────────────────
export const PAGINATION = Object.freeze({
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
});

// ──────────────────────────────────────────────
// Trust Score Configuration
// ──────────────────────────────────────────────
export const TRUST_SCORE = Object.freeze({
  DEFAULT: 50,
  MIN: 0,
  MAX: 100,
  KYC_VERIFIED_BONUS: 15,
  COMPLETED_BOOKING_BONUS: 2,
  POSITIVE_REVIEW_BONUS: 3,
  REPORT_PENALTY: -10,
  CANCELLED_PENALTY: -5,
});

// ──────────────────────────────────────────────
// Platform Configuration
// ──────────────────────────────────────────────
export const PLATFORM_CONFIG = Object.freeze({
  MIN_AGE: 18,
  MAX_AGE: 65,
  MIN_HOURLY_RATE: 200,
  MAX_HOURLY_RATE: 50000,
  PLATFORM_FEE_PERCENT: 20,
  MAX_PROFILE_PHOTOS: 4,
  MIN_PROFILE_PHOTOS: 2,
  MAX_PORTFOLIO_PHOTOS: 10,
  BIO_MAX_LENGTH: 500,
  TAGLINE_MAX_LENGTH: 150,
  REVIEW_MAX_LENGTH: 500,
  REPORT_DESCRIPTION_MAX_LENGTH: 1000,
});
