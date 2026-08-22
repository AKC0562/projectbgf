import { ID, Query } from "appwrite";
import { tablesDB } from "./client";
import env from "../config/config";

const reviewProvider = {
  async create(data) {
    return await tablesDB.createRow({
      databaseId: env.appwriteDatabaseId,
      tableId: env.appwriteReviewTableId,
      rowId: ID.unique(),
      data,
    });
  },

  async getById(reviewId) {
    return await tablesDB.getRow({
      databaseId:env.appwriteDatabaseId,
      tableId: env.appwriteReviewTableId,
      rowId: reviewId,
    });
  },

  async getByCompanionId(companionId) {
    const response = await tablesDB.listRows({
      databaseId:env.appwriteDatabaseId,
      tableId: env.appwriteReviewTableId,
      queries: [
        Query.equal("companionId", companionId),
        Query.equal("isPublished", true),
      ],
    });

    return response.rows;
  },

  async getByClientId(clientId) {
    const response = await tablesDB.listRows({
      databaseId: env.appwriteDatabaseId,
      tableId: env.appwriteReviewTableId,
      queries: [
        Query.equal("clientId", clientId),
      ],
    });

    return response.rows;
  },

  async getByBookingId(bookingId) {
    const response = await tablesDB.listRows({
      databaseId: env.appwriteDatabaseId,
      tableId: env.appwriteReviewTableId,
      queries: [
        Query.equal("bookingId", bookingId),
        Query.limit(1),
      ],
    });

    return response.rows[0] || null;
  },

  async update(reviewId, data) {
    return await tablesDB.updateRow({
      databaseId: env.appwriteDatabaseId,
      tableId: env.appwriteReviewTableId,
      rowId: reviewId,
      data,
    });
  },

  async delete(reviewId) {
    return await tablesDB.deleteRow({
      databaseId: env.appwriteDatabaseId,
      tableId: env.appwriteReviewTableId,
      rowId: reviewId,
    });
  },
};

export default reviewProvider;