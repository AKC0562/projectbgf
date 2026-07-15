/**
 * ==========================================================
 * FILE: src/routes/companion.routes.js
 * ==========================================================
 *
 * WHY THIS FILE EXISTS:
 * ---------------------
 * Maps companion-related endpoints. Two groups of routes:
 *
 * 1. Companion self-management (create/update own profile)
 * 2. Discovery/search (clients finding companions)
 *
 * HOW IT CONNECTS:
 * ----------------
 * - Mounted in app.js as: app.use('/api/v1/companions', companionRoutes)
 * - All routes require authentication
 * - Profile creation requires KYC verification
 */

import { Router } from 'express';

// Controllers
import {
  createCompanionProfile,
  getMyCompanionProfile,
  updateCompanionProfile,
  searchCompanions,
  getCompanionProfile,
  getCategories,
} from '../controllers/companion.controller.js';

// Validators
import {
  createCompanionProfileValidator,
  updateCompanionProfileValidator,
  searchCompanionsValidator,
} from '../validators/companion.validator.js';

// Middleware
import validate from '../middleware/validate.js';
import protect from '../middleware/auth.js';
import kycRequired from '../middleware/kycRequired.js';

const router = Router();

// ── Public-ish route (still behind auth but all roles can access) ──
router.get('/categories', protect, getCategories);

// ── All routes below require authentication ──
router.use(protect);

// ── Discovery (clients searching for companions) ──
router.get('/search', searchCompanionsValidator, validate, searchCompanions);
router.get('/:companionId', getCompanionProfile);

// ── Companion Self-Management ──
router.post('/profile', kycRequired, createCompanionProfileValidator, validate, createCompanionProfile);
router.get('/profile/me', getMyCompanionProfile);
router.put('/profile/me', updateCompanionProfileValidator, validate, updateCompanionProfile);

export default router;
