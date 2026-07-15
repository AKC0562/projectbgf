/**
 * ==========================================================
 * FILE: src/config/cloudinary.js
 * ==========================================================
 *
 * WHY THIS FILE EXISTS:
 * ---------------------
 * Companion allows users to upload 2-4 profile photos, KYC documents,
 * portfolio images, and report evidence. We use Cloudinary as our CDN-backed
 * image storage because:
 * 1. It handles image transformation (resize, crop, optimize) on the fly
 * 2. It serves images via CDN (fast load times across India)
 * 3. It manages storage lifecycle (no local disk management needed)
 *
 * This file configures the Cloudinary SDK with credentials from .env and
 * exports the configured instance. Every service that uploads/deletes
 * images imports from here — there's one single place to change if we
 * ever switch providers.
 *
 * HOW IT CONNECTS:
 * ----------------
 * - user.controller.js uses it for profile photo uploads
 * - companion.controller.js uses it for portfolio photo uploads
 * - report.controller.js uses it for evidence uploads
 * - KYC flow uses it for document uploads
 */

import { v2 as cloudinary } from 'cloudinary';

/**
 * Configure Cloudinary with environment credentials.
 *
 * IMPORTANT: These values MUST be set in .env before any upload will work.
 * The app will start without them (so development without uploads is possible),
 * but upload operations will fail at runtime with a clear error.
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
