/**
 * ==========================================================
 * FILE: src/middleware/authorize.js
 * ==========================================================
 *
 * WHY THIS FILE EXISTS:
 * ---------------------
 * Authentication (auth.js) answers "WHO are you?"
 * Authorization (this file) answers "WHAT are you allowed to do?"
 *
 * After auth.js confirms the user is logged in, authorize checks if
 * the user's role permits access to the requested endpoint.
 *
 * Usage in routes:
 *   router.delete('/users/:id', protect, authorize('admin'), deleteUser)
 *   router.post('/bookings', protect, authorize('client', 'admin'), createBooking)
 *
 * This is a higher-order function (a function that returns a function)
 * because we need to pass in the allowed roles at route registration time,
 * but the actual check runs at request time.
 *
 * HOW IT CONNECTS:
 * ----------------
 * - Runs AFTER auth.js (depends on req.user being set)
 * - Used in admin routes (authorize('admin'))
 * - Used in companion-only routes (authorize('companion'))
 * - Used in flexible routes (authorize('client', 'companion'))
 */

import ApiError from '../utils/ApiError.js';

/**
 * Role-based authorization middleware factory.
 *
 * @param {...string} allowedRoles - Roles that can access this endpoint
 * @returns {Function} Express middleware
 *
 * @example
 * // Only admins can access
 * router.get('/admin/dashboard', protect, authorize('admin'), getDashboard);
 *
 * // Both clients and companions can access
 * router.get('/bookings', protect, authorize('client', 'companion'), getBookings);
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // req.user is set by auth.js (protect middleware)
    // If it's missing, auth.js didn't run — that's a server config error
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required before authorization');
    }

    // Check if the user's role is in the list of allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      throw ApiError.forbidden(
        `Role '${req.user.role}' is not authorized to access this resource. ` +
        `Required: ${allowedRoles.join(' or ')}`
      );
    }

    next();
  };
};

export default authorize;
