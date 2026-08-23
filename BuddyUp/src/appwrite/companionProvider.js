import { Query } from "appwrite";

import env from "../config/config";
import { tablesDB } from "./client";

const companionProvider = {
  // --------------------------------
  // CREATE COMPANION PROFILE
  // --------------------------------
  async createProfile({
    userId,
    ...profileData
  }) {
    return await tablesDB.createRow({
      databaseId: env.appwriteDatabaseId,
      tableId: env.appwriteCompanionsTableId,

      // Auth $id = Companion profile rowId
      rowId: userId,

      data: profileData,
    });
  },

  // --------------------------------
  // GET BY COMPANION ID
  // --------------------------------
  async getById(companionId) {
    return await tablesDB.getRow({
      databaseId: env.appwriteDatabaseId,
      tableId: env.appwriteCompanionsTableId,
      rowId: companionId,
    });
  },

  // --------------------------------
  // GET BY USER / AUTH ID
  // --------------------------------
  async getByUserId(userId) {
    return await tablesDB.getRow({
      databaseId: env.appwriteDatabaseId,
      tableId: env.appwriteCompanionsTableId,
      rowId: userId,
    });
  },

  // --------------------------------
  // GET ALL ACTIVE COMPANIONS
  // --------------------------------
  async getAll() {
    const response = await tablesDB.listRows({
      databaseId: env.appwriteDatabaseId,
      tableId: env.appwriteCompanionsTableId,

      queries: [
        Query.equal("isActive", true),
      ],
    });

    return response.rows;
  },

  // --------------------------------
  // UPDATE PROFILE
  // --------------------------------
  async updateProfile(
    companionId,
    data
  ) {
    return await tablesDB.updateRow({
      databaseId: env.appwriteDatabaseId,
      tableId: env.appwriteCompanionsTableId,
      rowId: companionId,
      data: data,
    });
  },

  // --------------------------------
  // DELETE PROFILE
  // --------------------------------
  async deleteProfile(companionId) {
    return await tablesDB.deleteRow({
      databaseId: env.appwriteDatabaseId,
      tableId: env.appwriteCompanionsTableId,
      rowId: companionId,
    });
  },
};

export default companionProvider;