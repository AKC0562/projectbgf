/**
 * ==========================================================
 * FILE: src/controllers/payment.controller.js
 * ==========================================================
 */

import paymentService from '../services/payment.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @route   POST /api/v1/payments/create-order
 * @desc    Create a Razorpay order for a booking
 * @access  Private
 */
export const createOrder = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;

  const order = await paymentService.createOrder(bookingId);

  res.status(201).json(
    new ApiResponse(201, order, 'Payment order created')
  );
});

/**
 * @route   POST /api/v1/payments/verify
 * @desc    Verify Razorpay payment signature
 * @access  Private
 */
export const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, paymentId, signature } = req.body;

  const booking = await paymentService.verifyPayment(orderId, paymentId, signature);

  res.status(200).json(
    new ApiResponse(200, { bookingId: booking._id, paymentStatus: booking.paymentStatus }, 'Payment verified — funds held in escrow')
  );
});

/**
 * @route   POST /api/v1/payments/webhook
 * @desc    Razorpay webhook handler (server-to-server)
 * @access  Public (verified by Razorpay signature)
 *
 * This endpoint is called by Razorpay to notify us of payment events.
 * In production, verify the webhook signature from Razorpay headers.
 */
export const handleWebhook = asyncHandler(async (req, res) => {
  // In production, verify webhook signature:
  // const webhookSignature = req.headers['x-razorpay-signature'];
  // const isValid = Razorpay.validateWebhookSignature(
  //   JSON.stringify(req.body), webhookSignature, process.env.RAZORPAY_WEBHOOK_SECRET
  // );

  const { event, payload } = req.body;

  switch (event) {
    case 'payment.captured':
      // Payment successfully captured — update booking
      console.log('Payment captured:', payload.payment.entity.id);
      break;

    case 'payment.failed':
      console.log('Payment failed:', payload.payment.entity.id);
      break;

    case 'refund.processed':
      console.log('Refund processed:', payload.refund.entity.id);
      break;

    default:
      console.log('Unhandled webhook event:', event);
  }

  // Always return 200 to acknowledge receipt
  res.status(200).json({ received: true });
});
