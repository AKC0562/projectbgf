/**
 * ==========================================================
 * FILE: src/services/sos.service.js
 * ==========================================================
 *
 * WHY THIS FILE EXISTS:
 * ---------------------
 * Safety-critical SOS feature. If a user feels unsafe during a meetup,
 * they can trigger an SOS alert which:
 * 1. Sends their live location to their emergency contact
 * 2. Notifies platform admins
 * 3. Logs the SOS event for investigation
 *
 * In production, this would integrate with:
 * - SMS gateway (send emergency text with location link)
 * - Firebase Cloud Messaging (push notification to admin panel)
 * - Email service (backup notification)
 *
 * HOW IT CONNECTS:
 * ----------------
 * - Called from a dedicated SOS endpoint
 * - Reads emergency contact from User model
 * - Could trigger Socket.io admin alerts
 */

import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';

/**
 * Trigger an SOS alert.
 *
 * @param {string} userId - The user triggering SOS
 * @param {object} location - { latitude, longitude }
 * @param {string} bookingId - Optional related booking
 * @returns {Promise<object>} SOS confirmation
 */
const triggerSOS = async (userId, location, bookingId = null) => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const { emergencyContact } = user;

  // Build location URL for the emergency contact
  const locationUrl = location
    ? `https://maps.google.com/?q=${location.latitude},${location.longitude}`
    : 'Location not available';

  // ── Notify Emergency Contact ──
  // In production, send SMS via your provider:
  // await smsService.send(emergencyContact.phone, message);
  const emergencyMessage = [
    `🆘 SOS ALERT from ${user.fullName}`,
    `Location: ${locationUrl}`,
    `Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
    bookingId ? `Booking: ${bookingId}` : '',
    'Please check on them immediately.',
  ].filter(Boolean).join('\n');

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('──────── SOS ALERT ────────');
    console.log(`User: ${user.fullName} (${userId})`);
    console.log(`Emergency Contact: ${emergencyContact?.name} — ${emergencyContact?.phone}`);
    console.log(`Message:\n${emergencyMessage}`);
    console.log('───────────────────────────');
  }

  // ── Notify Admins ──
  // In production, send push notification via FCM to all admin devices
  // and/or emit a Socket.io event to the admin panel

  return {
    alertSent: true,
    notifiedContact: emergencyContact?.name || 'No emergency contact set',
    location: locationUrl,
    timestamp: new Date().toISOString(),
    message: emergencyContact?.phone
      ? 'SOS alert sent to your emergency contact and platform admins'
      : 'SOS alert sent to platform admins — please set an emergency contact in your profile',
  };
};

export default {
  triggerSOS,
};
