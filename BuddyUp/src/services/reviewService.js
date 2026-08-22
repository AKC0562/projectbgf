import reviewProvider from "../appwrite/reviewProvider";

const reviewService = {
  async create(data) {
    return await reviewProvider.create(data);
  },

  async getById(reviewId) {
    return await reviewProvider.getById(reviewId);
  },

  async getByCompanionId(companionId) {
    return await reviewProvider.getByCompanionId(
      companionId
    );
  },

  async getByClientId(clientId) {
    return await reviewProvider.getByClientId(clientId);
  },

  async getByBookingId(bookingId) {
    return await reviewProvider.getByBookingId(
      bookingId
    );
  },

  async update(reviewId, data) {
    return await reviewProvider.update(
      reviewId,
      data
    );
  },

  async delete(reviewId) {
    return await reviewProvider.delete(reviewId);
  },
};

export default reviewService;