/**
 * ==========================================================
 * FILE: src/routes/review.routes.js
 * ==========================================================
 */

import { Router } from 'express';
import { createReview, getReviewsForUser, getReviewStats } from '../controllers/review.controller.js';
import { createReviewValidator, getReviewsValidator } from '../validators/review.validator.js';
import validate from '../middleware/validate.js';
import protect from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.post('/', createReviewValidator, validate, createReview);
router.get('/user/:userId', getReviewsValidator, validate, getReviewsForUser);
router.get('/user/:userId/stats', getReviewsValidator, validate, getReviewStats);

export default router;
