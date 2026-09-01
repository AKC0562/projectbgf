import { ID, Permission, Role } from "appwrite";

import { storage } from "./client";
import env from "../config/config";

const storageProvider = {
  // --------------------------------
  // UPLOAD PROFILE IMAGE
  // --------------------------------
  async uploadProfileImage(file) {
    if (!file) {
      throw new Error("Profile image is required.");
    }

    return await storage.createFile({
      bucketId: env.appwriteBucketId,

      fileId: ID.unique(),

      file,

      // File-level permissions
      permissions: [
        Permission.read(Role.any()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ],
    });
  },

  // --------------------------------
  // GET PROFILE IMAGE PREVIEW
  // --------------------------------
  getFilePreview(fileId) {
    if (!fileId) {
      return null;
    }

    return storage.getFilePreview({
      bucketId: env.appwriteBucketId,
      fileId,
    });
  },

  // --------------------------------
  // DELETE PROFILE IMAGE
  // --------------------------------
  async deleteFile(fileId) {
    if (!fileId) {
      return null;
    }

    return await storage.deleteFile({
      bucketId: env.appwriteBucketId,
      fileId,
    });
  },
};

export default storageProvider;