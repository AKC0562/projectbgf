/**
 * ==========================================================
 * FILE: src/models/Category.js
 * ==========================================================
 *
 * WHY THIS FILE EXISTS:
 * ---------------------
 * Categories define the types of companion activities available on the
 * platform: Coffee Companion, Study Buddy, Gym Partner, etc.
 *
 * Why is this a database model instead of hardcoded constants?
 * Because the admin needs to:
 * 1. Add new categories without code deployment
 * 2. Deactivate categories (seasonal or discontinued)
 * 3. Reorder how categories appear in the app
 * 4. Track how many companions offer each category
 * 5. Attach icons/images for the mobile app UI
 *
 * The initial categories are seeded from the constants (CATEGORY_SLUGS),
 * but new ones can be created through the admin panel.
 *
 * HOW IT CONNECTS:
 * ----------------
 * - CompanionProfile.categories is an array of refs to this model
 * - Booking.categoryId references the activity type for a booking
 * - Admin APIs manage CRUD operations on categories
 * - The mobile app fetches active categories to display on the home screen
 */

import mongoose from 'mongoose';
import { slugify } from '../utils/helpers.js';

const { Schema } = mongoose;

const categorySchema = new Schema(
  {
    // Human-readable name displayed in the app
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'Category name cannot exceed 100 characters'],
    },

    // URL-safe version of the name, auto-generated from name
    // Used in URLs: /categories/coffee-companion
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Brief description for the category detail page
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },

    // Icon identifier or URL — used by the mobile app to display
    // the category in grids/carousels
    icon: {
      type: String,
      trim: true,
      default: '',
    },

    // Admin can deactivate a category without deleting it.
    // Existing bookings in this category remain valid,
    // but no new companion profiles can add it.
    isActive: {
      type: Boolean,
      default: true,
    },

    // Controls the display order in the app's category carousel.
    // Lower number = appears first.
    sortOrder: {
      type: Number,
      default: 0,
    },

    // Denormalized counter — how many active companion profiles
    // list this category. Updated when companions add/remove categories.
    // Avoids expensive COUNT queries on CompanionProfile collection.
    companionCount: {
      type: Number,
      default: 0,
      min: 0,
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

// Sort by active status + display order (for the home screen query)
categorySchema.index({ isActive: 1, sortOrder: 1 });

// ──────────────────────────────────────────────
// Pre-Save Hook: Auto-Generate Slug
// ──────────────────────────────────────────────
/**
 * If the name was changed (or this is a new document), automatically
 * generate the slug from the name.
 *
 * "Coffee Companion" → "coffee-companion"
 * "Study Buddy" → "study-buddy"
 */
categorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name);
  }
  next();
});

const Category = mongoose.model('Category', categorySchema);

export default Category;
