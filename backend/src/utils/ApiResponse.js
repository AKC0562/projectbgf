/**
 * ==========================================================
 * FILE: src/utils/ApiResponse.js
 * ==========================================================
 *
 * WHY THIS FILE EXISTS:
 * ---------------------
 * Just as ApiError standardizes error responses, ApiResponse standardizes
 * success responses. Every successful API response from our backend follows
 * this exact shape:
 *
 *   {
 *     "statusCode": 200,
 *     "success": true,
 *     "message": "User fetched successfully",
 *     "data": { ... }
 *   }
 *
 * This consistency makes life easy for frontend developers — they always
 * know `response.data.success` is a boolean, `response.data.data` has
 * the payload, and `response.data.message` explains what happened.
 *
 * HOW IT CONNECTS:
 * ----------------
 * - Controllers use: res.status(200).json(new ApiResponse(200, data, message))
 * - This pairs with ApiError to create a fully predictable response contract
 */

class ApiResponse {
  /**
   * @param {number} statusCode - HTTP status code (200, 201, 204)
   * @param {*} data - The response payload (object, array, null)
   * @param {string} message - Human-readable success message
   */
  constructor(statusCode, data = null, message = 'Success') {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
  }

  /**
   * Factory: 200 OK with data
   */
  static ok(data, message = 'Success') {
    return new ApiResponse(200, data, message);
  }

  /**
   * Factory: 201 Created
   * Use after creating a new resource (user, booking, review).
   */
  static created(data, message = 'Resource created successfully') {
    return new ApiResponse(201, data, message);
  }

  /**
   * Factory: 200 with pagination metadata
   * Use for list endpoints that support pagination.
   *
   * @param {Array} data - Array of documents
   * @param {object} pagination - { page, limit, total, totalPages }
   * @param {string} message
   */
  static paginated(data, pagination, message = 'Success') {
    return new ApiResponse(200, { results: data, pagination }, message);
  }
}

export default ApiResponse;
