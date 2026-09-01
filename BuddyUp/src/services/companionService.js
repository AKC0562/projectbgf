import companionProvider from "../appwrite/companionProvider";
import storageService from "./storageService";

const normalizeCompanion = (companion) => {
  if (!companion) {
    return null;
  }

  return {
    ...companion,

    avatar: companion.avatarFileId
      ? storageService.getFilePreview(
          companion.avatarFileId
        )?.toString() || null
      : null,

    activities: Array.isArray(
      companion.activities
    )
      ? companion.activities
      : [],

    languages: Array.isArray(
      companion.languages
    )
      ? companion.languages
      : [],

    rating: companion.rating ?? 0,

    reviews: companion.reviews ?? 0,

    isVerified:
      companion.isVerified ?? false,

    isAvailable:
      companion.isAvailable ?? false,
  };
};

const companionService = {
  // --------------------------------
  // CREATE
  // --------------------------------
  async createProfile(data) {
    const response =
      await companionProvider.createProfile(
        data
      );

    return normalizeCompanion(response);
  },

  // --------------------------------
  // GET BY ID
  // --------------------------------
  async getById(companionId) {
    const response =
      await companionProvider.getById(
        companionId
      );

    return normalizeCompanion(response);
  },

  // --------------------------------
  // GET BY USER ID
  // --------------------------------
  async getByUserId(userId) {
    const response =
      await companionProvider.getByUserId(
        userId
      );

    return normalizeCompanion(response);
  },
  //---------------------------------
  //Update Location
  //---------------------------------
  async updateLocation(
  companionId,
  locationData
) {
  const response =
    await companionProvider.updateLocation(
      companionId,
      locationData
    );

  return normalizeCompanion(response);
},

  // --------------------------------
  // GET ALL
  // --------------------------------
  async getAll() {
    const response =
      await companionProvider.getAll();

    return response.map(
      normalizeCompanion
    );
  },

  // --------------------------------
  // UPDATE
  // --------------------------------
  async updateProfile(
    companionId,
    data
  ) {
    const response =
      await companionProvider.updateProfile(
        companionId,
        data
      );

    return normalizeCompanion(response);
  },

  // --------------------------------
  // DELETE
  // --------------------------------
  async deleteProfile(companionId) {
    return await companionProvider.deleteProfile(
      companionId
    );
  },
};

export default companionService;