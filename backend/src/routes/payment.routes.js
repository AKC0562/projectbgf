/**
 * ==========================================================
 * FILE: src/routes/payment.routes.js
 * ==========================================================
 */

import { Router } from 'express';
import { createOrder, verifyPayment, handleWebhook } from '../controllers/payment.controller.js';
import { body } from 'express-validator';
import validate from '../middleware/validate.js';
import protect from '../middleware/auth.js';

const router = Router();

// ── Webhook (public — called by Razorpay servers) ──
router.post('/webhook', handleWebhook);

// ── Protected Routes ──
router.use(protect);

router.post(
  '/create-order',
  [body('bookingId').isMongoId().withMessage('Invalid booking ID')],
  validate,
  createOrder
);

router.post(
  '/verify',
  [
    body('orderId').notEmpty().withMessage('Order ID is required'),
    body('paymentId').notEmpty().withMessage('Payment ID is required'),
    body('signature').notEmpty().withMessage('Signature is required'),
  ],
  validate,
  verifyPayment
);

export default router;
