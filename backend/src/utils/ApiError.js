/**
 * ==========================================================
 * FILE: src/utils/ApiError.js
 * ==========================================================
 *
 * WHY THIS FILE EXISTS:
 * ---------------------
 * In a production API, errors must be predictable. Every consumer of our API
 * (mobile app, web frontend, admin panel) needs to receive errors in a
 * consistent JSON shape with the correct HTTP status code.
 *
 * Without a custom error class, you'd be doing this in every controller:
 *   res.status(400).json({ success: false, message: '...' })
 *
 * That scatters response formatting across 50+ files. Instead, we throw:
 *   throw new ApiError(400, 'Validation failed', errors)
 *
 * ...and the centralized errorHandler middleware (errorHandler.js) catches
 * it and formats the response once, in one place.
 *
 * HOW IT CONNECTS:
 * ----------------
 * - Controllers/services THROW ApiError instances
 * - asyncHandler catches the thrown error and passes to next()
 * - errorHandler middleware checks `instanceof ApiError` to decide
 *   whether this is an expected (operational) error or a bug
 *
 * KEY DESIGN DECISION:
 * --------------------
 * `isOperational` flag: Operational errors (bad input, not found, unauthorized)
 * are safe to expose to the client. Non-operational errors (null reference,
 * DB driver crash) indicate a programming bug — we log the stack but send
 * a generic "Internal Server Error" to the client.
 */

class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code (400, 401, 403, 404, 500, etc.)
   * @param {string} message - Human-readable error message for the client
   * @param {Array} errors - Optional array of field-level validation errors
   * @param {string} stack - Optional custom stack trace (rare, mainly for testing)
   */
  constructor(
    statusCode,
    message = 'Something went wrong',
    errors = [],
    stack = ''
  ) {
    // Call parent Error constructor with the message
    super(message);

    // HTTP status code — used by errorHandler to set res.status()
    this.statusCode = statusCode;

    // Payload for structured validation errors
    // e.g. [{ field: 'email', message: 'Invalid email format' }]
    this.errors = errors;

    // `success` is always false for errors — matches ApiResponse shape
    this.success = false;

    // Operational = expected errors (bad input, auth failure)
    // Non-operational = bugs (should trigger alerts in production)
    this.isOperational = true;

    // If a custom stack is provided (testing), use it.
    // Otherwise, capture the stack trace starting from this constructor
    // so the stack doesn't include the ApiError constructor itself.
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Factory: 400 Bad Request
   * Use for validation failures, malformed input, missing required fields.
   */
  static badRequest(message = 'Bad request', errors = []) {
    return new ApiError(400, message, errors);
  }

  /**
   * Factory: 401 Unauthorized
   * Use when authentication is missing or invalid (no token, expired token).
   */
  static unauthorized(message = 'Unauthorized — please log in') {
    return new ApiError(401, message);
  }

  /**
   * Factory: 403 Forbidden
   * Use when the user IS authenticated but lacks permission for this action.
   */
  static forbidden(message = 'Forbidden — insufficient permissions') {
    return new ApiError(403, message);
  }

  /**
   * Factory: 404 Not Found
   * Use when the requested resource doesn't exist.
   */
  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }

  /**
   * Factory: 409 Conflict
   * Use for duplicate entries (email already exists, booking already accepted).
   */
  static conflict(message = 'Resource already exists') {
    return new ApiError(409, message);
  }

  /**
   * Factory: 429 Too Many Requests
   * Use when rate limit is exceeded.
   */
  static tooManyRequests(message = 'Too many requests — please try again later') {
    return new ApiError(429, message);
  }

  /**
   * Factory: 500 Internal Server Error
   * Use sparingly — most 500s should be unhandled exceptions caught
   * by the error handler, not intentionally thrown.
   */
  static internal(message = 'Internal server error') {
    const error = new ApiError(500, message);
    error.isOperational = false;
    return error;
  }
}

export default ApiError;
