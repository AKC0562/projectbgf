/**
 * ==========================================================
 * FILE: src/models/Report.js
 * ==========================================================
 *
 * WHY THIS FILE EXISTS:
 * ---------------------
 * The safety reporting system. Any user can report another user for
 * harassment, inappropriate behavior, fake profiles, etc. Reports
 * are reviewed by admins who can investigate, resolve, or dismiss.
 *
 * HOW IT CONNECTS:
 * ----------------
 * - report.service.js creates reports and manages their lifecycle
 * - admin.service.js reviews and resolves reports
 * - Trust score is affected when a report is resolved against a user
 * - Evidence (photos, screenshots) stored via Cloudinary
 */

import mongoose from 'mongoose';
import {
  REPORT_REASONS_ARRAY,
  REPORT_STATUS,
  REPORT_STATUS_ARRAY,
  PLATFORM_CONFIG,
} from '../constants/index.js';

const { Schema } = mongoose;

const reportSchema = new Schema(
  {
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporter ID is required'],
    },

    reportedUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reported user ID is required'],
    },

    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
    },

    reason: {
      type: String,
      enum: {
        values: REPORT_REASONS_ARRAY,
        message: 'Report reason must be one of: {VALUE}',
      },
      required: [true, 'Report reason is required'],
    },

    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [PLATFORM_CONFIG.REPORT_DESCRIPTION_MAX_LENGTH, `Description cannot exceed ${PLATFORM_CONFIG.REPORT_DESCRIPTION_MAX_LENGTH} characters`],
    },

    evidence: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],

    status: {
      type: String,
      enum: {
        values: REPORT_STATUS_ARRAY,
        message: 'Report status must be one of: {VALUE}',
      },
      default: REPORT_STATUS.PENDING,
    },

    adminNotes: {
      type: String,
      trim: true,
    },

    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Find reports by status (admin dashboard)
reportSchema.index({ status: 1, createdAt: -1 });

// Find reports against a specific user
reportSchema.index({ reportedUserId: 1 });

// Find reports by a specific reporter
reportSchema.index({ reporterId: 1 });

const Report = mongoose.model('Report', reportSchema);

export default Report;
